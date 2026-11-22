// Kleiner Server für johannesbrix.com (Cloudflare Worker + D1). Einrichtung: docs/brixmap.md
//
// Öffentlich (nur von den Seiten in ERLAUBTE_URSPRUENGE):
//   GET  /klicks   Stand des Klick-Zählers aller Besucher
//   POST /klicks   { anzahl } gebündelte Klicks zählen, mit Grenzen gegen Auto-Klicker
//   GET  /orte     Orte auf der Brixmap (Empfehlungen und Johannes' eigene)
//   POST /orte     neuer Ort; erscheint sofort auf der Karte (mit FREIGABE = "pruefen" erst nach Freigabe).
//                  Mit Geräte-Schlüssel von Johannes (Feld „ich“) wird es sein eigener Ort.
//   GET  /suche?q= Ortssuche über Nominatim (OpenStreetMap), ohne die IP der Besucher weiterzugeben
// Nur für Johannes:
//   POST /orte/aendern  mit Geräte-Schlüssel: Ort löschen, direkt auf der Karte
//   /admin              mit Passwort: Gerät freischalten, Orte bearbeiten und löschen, Zähler korrigieren

import { anmeldeSeite, adminSeite } from './admin.js';

export const KATEGORIEN = {
  essen: 'Essen & Trinken',
  'hidden-spot': 'Hidden Spot',
  treffpunkt: 'Treffpunkt',
  sonstiges: 'Sonstiges',
};

// Grenzen gegen Missbrauch. Was darüber liegt, wird still nicht gezählt.
const GRENZEN = {
  klicksProAnfrage: 10, // so viele Klicks bündelt die Seite höchstens in einer Anfrage
  klickAnfragenProMinute: 60, // pro Besucher
  klicksProTag: 500, // pro Besucher
  klicksAllerProMinute: 3000, // alle Besucher zusammen
  empfehlungenProStunde: 5, // pro Besucher
  empfehlungenProTag: 15, // pro Besucher
  empfehlungenAllerProTag: 100, // alle Besucher zusammen
  orteHoechstens: 2000, // so viele Empfehlungen zeigt die Karte höchstens
  wartendeHoechstens: 300, // nur mit FREIGABE = "pruefen": Empfehlungen, die auf Freigabe warten
  suchenProMinute: 20, // pro Besucher
  anmeldungenProStunde: 10, // Fehlversuche am Admin-Login pro Besucher
};
const MINUTE = 60_000;
const STUNDE = 60 * MINUTE;
const TAG = 24 * STUNDE;
const SITZUNG_TAGE = 30;
const GERAET_TAGE = 365; // so lange gilt die Freischaltung eines Geräts

export default {
  async fetch(request, env, ctx) {
    try {
      return await beantworten(request, env, ctx);
    } catch (fehler) {
      console.error(fehler);
      return json({ fehler: 'Da ist etwas schiefgegangen.' }, 500, request, env);
    }
  },
  // Nächtlich: abgelaufene Grenz-Zähler löschen
  async scheduled(event, env) {
    await env.DB.prepare('DELETE FROM grenzen WHERE bis < ?').bind(Date.now()).run();
  },
};

async function beantworten(request, env, ctx) {
  const url = new URL(request.url);
  const pfad = url.pathname.replace(/\/+$/, '') || '/';
  const methode = request.method;

  if (pfad === '/admin' || pfad.startsWith('/admin/')) return admin(request, env, url, pfad);
  if (methode === 'OPTIONS') return vorabAnfrage(request, env);
  if (pfad === '/klicks' && methode === 'GET') return klicksLesen(request, env);
  if (pfad === '/klicks' && methode === 'POST') return klicksZaehlen(request, env);
  if (pfad === '/orte' && methode === 'GET') return orteLesen(request, env);
  if (pfad === '/orte' && methode === 'POST') return ortEmpfehlen(request, env);
  if (pfad === '/orte/aendern' && methode === 'POST') return ortAendern(request, env);
  if (pfad === '/suche' && methode === 'GET') return suchen(request, env, ctx, url);
  if (pfad === '/') return new Response('johannesbrix.com', { headers: { 'content-type': 'text/plain; charset=utf-8' } });
  return json({ fehler: 'Nicht gefunden.' }, 404, request, env);
}

// ---------- Hilfen ----------

function erlaubterUrsprung(request, env) {
  const ursprung = request.headers.get('Origin');
  const liste = (env.ERLAUBTE_URSPRUENGE || '').split(',').map((s) => s.trim()).filter(Boolean);
  return ursprung && liste.includes(ursprung) ? ursprung : null;
}

function json(daten, status, request, env, kopf = {}) {
  const headers = { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', ...kopf };
  const ursprung = erlaubterUrsprung(request, env);
  if (ursprung) {
    headers['access-control-allow-origin'] = ursprung;
    headers.vary = 'Origin';
  }
  return new Response(JSON.stringify(daten), { status, headers });
}

function vorabAnfrage(request, env) {
  const ursprung = erlaubterUrsprung(request, env);
  if (!ursprung) return new Response(null, { status: 403 });
  return new Response(null, {
    status: 204,
    headers: {
      'access-control-allow-origin': ursprung,
      'access-control-allow-methods': 'GET, POST',
      'access-control-allow-headers': 'content-type',
      'access-control-max-age': '86400',
      vary: 'Origin',
    },
  });
}

// JSON aus dem Body lesen; sendBeacon schickt text/plain, deshalb unabhängig vom Content-Type
async function jsonLesen(request) {
  try {
    const text = await request.text();
    return text.length > 4000 ? null : JSON.parse(text);
  } catch {
    return null;
  }
}

// Steuerzeichen raus, Leerraum zusammenfassen, kürzen
function text(wert, max) {
  return String(wert ?? '')
    .replace(/[\u0000-\u001f\u007f]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, max);
}

async function hmac(schluessel, inhalt) {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(schluessel), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const signatur = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(inhalt));
  return [...new Uint8Array(signatur)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

// Geräte-Schlüssel für Johannes: „bis.signatur“, ausgestellt auf der Admin-Seite, gespeichert im Browser
// seines Handys. Damit setzt er eigene Orte und verwaltet die Karte direkt auf der Seite.
async function geraeteSchluessel(env) {
  const bis = Date.now() + GERAET_TAGE * TAG;
  return `${bis}.${await hmac(env.SCHLUESSEL, `ich|${bis}`)}`;
}

async function istJohannes(env, schluessel) {
  const [bis, signatur] = String(schluessel ?? '').split('.');
  if (!env.SCHLUESSEL || !bis || !signatur || !(Number(bis) > Date.now())) return false;
  return signatur === (await hmac(env.SCHLUESSEL, `ich|${bis}`));
}

// Kennung eines Besuchers für die Grenzen: täglich wechselnder Hash der IP, die IP selbst wird nie gespeichert
async function besucher(request, env) {
  const ip = request.headers.get('CF-Connecting-IP') || 'unbekannt';
  const tag = new Date().toISOString().slice(0, 10);
  return (await hmac(env.SCHLUESSEL, `${tag}|${ip}`)).slice(0, 24);
}

// Zählt `menge` gegen eine Grenze pro Zeitfenster und gibt zurück, wie viel davon erlaubt ist.
// Ist die Grenze erreicht, wird nichts geschrieben; das schont das Schreibkontingent von D1.
async function grenze(env, name, fensterMs, hoechstens, menge = 1) {
  const fenster = Math.floor(Date.now() / fensterMs);
  const schluessel = `${name}:${fenster}`;
  const zeile = await env.DB.prepare('SELECT anzahl FROM grenzen WHERE schluessel = ?').bind(schluessel).first();
  const erlaubt = Math.max(0, Math.min(menge, hoechstens - (zeile?.anzahl ?? 0)));
  if (erlaubt > 0) {
    await env.DB.prepare(
      'INSERT INTO grenzen (schluessel, anzahl, bis) VALUES (?, ?, ?) ON CONFLICT(schluessel) DO UPDATE SET anzahl = anzahl + excluded.anzahl',
    )
      .bind(schluessel, erlaubt, (fenster + 1) * fensterMs)
      .run();
  }
  return erlaubt;
}

// ---------- Klick-Zähler ----------

async function klicksLesen(request, env) {
  const zeile = await env.DB.prepare("SELECT wert FROM zaehler WHERE name = 'klicks'").first();
  return json({ wert: zeile?.wert ?? 0 }, 200, request, env);
}

async function klicksZaehlen(request, env) {
  if (!erlaubterUrsprung(request, env)) return json({ fehler: 'Nicht erlaubt.' }, 403, request, env);
  const daten = await jsonLesen(request);
  const gewuenscht = Math.max(0, Math.min(GRENZEN.klicksProAnfrage, Math.floor(Number(daten?.anzahl) || 0)));
  let menge = 0;
  if (gewuenscht > 0) {
    const wer = await besucher(request, env);
    if (await grenze(env, `ka:${wer}`, MINUTE, GRENZEN.klickAnfragenProMinute)) {
      menge = await grenze(env, `kt:${wer}`, TAG, GRENZEN.klicksProTag, gewuenscht);
      if (menge > 0) menge = await grenze(env, 'kalle', MINUTE, GRENZEN.klicksAllerProMinute, menge);
    }
  }
  const zeile =
    menge > 0
      ? await env.DB.prepare("UPDATE zaehler SET wert = wert + ? WHERE name = 'klicks' RETURNING wert").bind(menge).first()
      : await env.DB.prepare("SELECT wert FROM zaehler WHERE name = 'klicks'").first();
  return json({ wert: zeile?.wert ?? 0, gezaehlt: menge }, 200, request, env);
}

// ---------- Brixmap ----------

const SPALTEN = 'id, name, kategorie, notiz, von, lat, lng, status';

async function orteLesen(request, env) {
  const { results } = await env.DB.prepare(
    `SELECT ${SPALTEN} FROM orte WHERE status IN ('offen', 'ich') ORDER BY id DESC LIMIT ${GRENZEN.orteHoechstens}`,
  ).all();
  // Kein Cache: Neue Orte und Johannes' Änderungen sollen sofort auf der Karte stehen
  return json({ orte: results }, 200, request, env);
}

// Webadressen haben in Empfehlungen nichts verloren; so lohnt sich die Karte nicht für Werbung
const LINK = /https?:\/\/|www\.|[a-z0-9-]{2,}\.(?:com|net|org|info|biz|io|xyz|top|ru|cn|de|shop|online|site)(?![a-z])/i;

// Prüft einen neuen Ort. Für Johannes' eigene Orte (ich = true) sind Notiz und Einwilligung freiwillig.
function empfehlungPruefen(d, ich = false) {
  const name = text(d.name, 80);
  const notiz = text(d.notiz, 300);
  const von = ich ? '' : text(d.von, 40);
  const kategorie = String(d.kategorie ?? '');
  const lat = Number(d.lat);
  const lng = Number(d.lng);
  if (name.length < 2) return { fehler: 'Bitte gib dem Ort einen Namen.' };
  if (!(kategorie in KATEGORIEN)) return { fehler: 'Bitte wähle aus, was es ist.' };
  if (!ich && notiz.length < 3) return { fehler: 'Bitte schreib kurz, warum du den Ort empfiehlst.' };
  if (!ich && [name, notiz, von].some((t) => LINK.test(t))) return { fehler: 'Bitte ohne Links oder Webadressen.' };
  if (!Number.isFinite(lat) || !Number.isFinite(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180) {
    return { fehler: 'Bitte wähle den Ort auf der Karte.' };
  }
  if (!ich && d.einwilligung !== true) return { fehler: 'Bitte bestätige, dass deine Empfehlung veröffentlicht werden darf.' };
  return { name, notiz, von, kategorie, lat: Math.round(lat * 1e5) / 1e5, lng: Math.round(lng * 1e5) / 1e5 };
}

async function ortEmpfehlen(request, env) {
  if (!erlaubterUrsprung(request, env)) return json({ fehler: 'Nicht erlaubt.' }, 403, request, env);
  const daten = await jsonLesen(request);
  if (!daten || typeof daten !== 'object') return json({ fehler: 'Ungültige Anfrage.' }, 400, request, env);

  // Johannes mit freigeschaltetem Gerät: sein eigener Ort, ohne Grenzen für Besucher
  if (daten.ich) {
    if (!(await istJohannes(env, daten.ich))) return json({ fehler: 'Die Freischaltung gilt nicht mehr.' }, 401, request, env);
    const ort = empfehlungPruefen(daten, true);
    if (ort.fehler) return json({ fehler: ort.fehler }, 400, request, env);
    const neu = await env.DB.prepare(
      `INSERT INTO orte (name, kategorie, notiz, von, lat, lng, status) VALUES (?, ?, ?, '', ?, ?, 'ich') RETURNING ${SPALTEN}`,
    )
      .bind(ort.name, ort.kategorie, ort.notiz, ort.lat, ort.lng)
      .first();
    return json({ ok: true, sichtbar: true, ort: neu }, 201, request, env);
  }

  // Honigtopf-Feld ausgefüllt oder in unter 3 Sekunden abgeschickt: vermutlich ein Bot.
  // Er bekommt ein freundliches „Danke“, gespeichert wird nichts.
  if (daten.website || Number(daten.dauer) < 3000) return json({ ok: true }, 201, request, env);
  const ort = empfehlungPruefen(daten);
  if (ort.fehler) return json({ fehler: ort.fehler }, 400, request, env);

  const wer = await besucher(request, env);
  const proStunde = await grenze(env, `es:${wer}`, STUNDE, GRENZEN.empfehlungenProStunde);
  const proTag = proStunde && (await grenze(env, `et:${wer}`, TAG, GRENZEN.empfehlungenProTag));
  if (!proStunde || !proTag) {
    return json({ fehler: 'Du hast gerade schon einige Orte empfohlen, danke! Bitte versuch es später nochmal.' }, 429, request, env);
  }
  if (!(await grenze(env, 'ealle', TAG, GRENZEN.empfehlungenAllerProTag))) {
    return json({ fehler: 'Heute sind schon sehr viele Orte dazugekommen. Bitte versuch es morgen nochmal.' }, 429, request, env);
  }
  // Sofort sichtbar, außer Johannes stellt FREIGABE auf "pruefen" (wrangler.toml)
  const pruefen = env.FREIGABE === 'pruefen';
  const bestand = await env.DB.prepare(
    "SELECT COUNT(*) AS alle, SUM(CASE WHEN status = 'neu' THEN 1 ELSE 0 END) AS wartend FROM orte",
  ).first();
  if ((bestand?.alle ?? 0) >= GRENZEN.orteHoechstens || (pruefen && (bestand?.wartend ?? 0) >= GRENZEN.wartendeHoechstens)) {
    return json({ fehler: 'Die Karte ist gerade voll. Bitte versuch es in ein paar Tagen nochmal.' }, 429, request, env);
  }
  const neu = await env.DB.prepare(
    `INSERT INTO orte (name, kategorie, notiz, von, lat, lng, status) VALUES (?, ?, ?, ?, ?, ?, ?) RETURNING ${SPALTEN}`,
  )
    .bind(ort.name, ort.kategorie, ort.notiz, ort.von, ort.lat, ort.lng, pruefen ? 'neu' : 'offen')
    .first();
  return json(pruefen ? { ok: true, sichtbar: false } : { ok: true, sichtbar: true, ort: neu }, 201, request, env);
}

// Johannes verwaltet die Karte direkt auf der Seite: { ich, id, aktion: 'loeschen' }
async function ortAendern(request, env) {
  if (!erlaubterUrsprung(request, env)) return json({ fehler: 'Nicht erlaubt.' }, 403, request, env);
  const daten = await jsonLesen(request);
  if (!daten || !(await istJohannes(env, daten.ich))) return json({ fehler: 'Die Freischaltung gilt nicht mehr.' }, 401, request, env);
  const id = Number(daten.id);
  if (!Number.isInteger(id) || daten.aktion !== 'loeschen') return json({ fehler: 'Ungültige Anfrage.' }, 400, request, env);
  await env.DB.prepare('DELETE FROM orte WHERE id = ?').bind(id).run();
  return json({ ok: true }, 200, request, env);
}

// Ortssuche über Nominatim. Nur auf Absenden, nicht beim Tippen (Nutzungsbedingungen von Nominatim).
async function suchen(request, env, ctx, url) {
  const begriff = text(url.searchParams.get('q'), 120);
  if (begriff.length < 2) return json({ treffer: [] }, 200, request, env);
  const wer = await besucher(request, env);
  if (!(await grenze(env, `su:${wer}`, MINUTE, GRENZEN.suchenProMinute))) {
    return json({ fehler: 'Bitte kurz warten und dann nochmal suchen.' }, 429, request, env);
  }
  const ziel = new URL('https://nominatim.openstreetmap.org/search');
  ziel.search = new URLSearchParams({ q: begriff, format: 'jsonv2', limit: '5', 'accept-language': 'de' }).toString();
  const cacheSchluessel = new Request(ziel.toString());
  let antwort = await caches.default.match(cacheSchluessel);
  if (!antwort) {
    antwort = await fetch(ziel, { headers: { 'User-Agent': `johannesbrix.com Brixmap (${env.SEITE || 'https://johannesbrix.com'}/impressum/)` } });
    if (antwort.ok) {
      antwort = new Response(antwort.body, antwort);
      antwort.headers.set('cache-control', 'public, max-age=86400');
      ctx.waitUntil(caches.default.put(cacheSchluessel, antwort.clone()));
    }
  }
  if (!antwort.ok) return json({ fehler: 'Die Suche ist gerade nicht erreichbar.' }, 502, request, env);
  const daten = await antwort.json();
  // Nominatim liefert für denselben Ort oft mehrere Objekte (Platz, Haltestelle, …) mit gleicher Adresse
  const gesehen = new Set();
  const treffer = daten
    .map((t) => ({
      name: t.name || String(t.display_name).split(',')[0],
      adresse: t.display_name,
      lat: Number(t.lat),
      lng: Number(t.lon),
    }))
    .filter((t) => !gesehen.has(t.adresse) && gesehen.add(t.adresse));
  return json({ treffer }, 200, request, env);
}

// ---------- Admin ----------

const SICHERHEIT = {
  'content-type': 'text/html; charset=utf-8',
  'cache-control': 'no-store',
  'x-frame-options': 'DENY',
  'x-content-type-options': 'nosniff',
  // same-origin statt no-referrer: Bei no-referrer schicken Browser bei Formularen „Origin: null“
  'referrer-policy': 'same-origin',
  'x-robots-tag': 'noindex',
  'content-security-policy': "default-src 'none'; style-src 'unsafe-inline'; form-action 'self'; frame-ancestors 'none'; base-uri 'none'",
};

const html = (inhalt, status = 200, kopf = {}) => new Response(inhalt, { status, headers: { ...SICHERHEIT, ...kopf } });
const weiter = (ziel, kopf = {}) => new Response(null, { status: 303, headers: { location: ziel, 'cache-control': 'no-store', ...kopf } });

async function angemeldet(request, env) {
  const keks = (request.headers.get('Cookie') || '').match(/(?:^|;\s*)sitzung=([^;]+)/);
  if (!keks) return false;
  const [bis, signatur] = keks[1].split('.');
  if (!bis || !signatur || Number(bis) < Date.now()) return false;
  return signatur === (await hmac(env.SCHLUESSEL, `admin|${bis}`));
}

async function admin(request, env, url, pfad) {
  if (!env.ADMIN_PASSWORT || !env.SCHLUESSEL) {
    return html('<p>Der Admin ist noch nicht eingerichtet: ADMIN_PASSWORT und SCHLUESSEL fehlen (docs/brixmap.md).</p>', 503);
  }
  // Formulare nur von der Admin-Seite selbst (Schutz vor untergeschobenen Anfragen).
  // Sec-Fetch-Site setzt der Browser selbst; eine fremde Seite kann ihn nicht fälschen.
  const vonHier = request.headers.get('Origin') === url.origin || request.headers.get('Sec-Fetch-Site') === 'same-origin';
  if (request.method === 'POST' && !vonHier) return html('Nicht erlaubt.', 403);

  if (pfad === '/admin/anmelden' && request.method === 'POST') {
    // Jeder Versuch zählt, und die Grenze greift vor dem Vergleich: Raten hilft auch dann nicht,
    // wenn irgendwann das richtige Passwort dabei wäre.
    const wer = await besucher(request, env);
    if (!(await grenze(env, `an:${wer}`, STUNDE, GRENZEN.anmeldungenProStunde))) {
      return html(anmeldeSeite({ fehler: 'Zu viele Versuche. Bitte in einer Stunde nochmal.' }), 429);
    }
    const formular = await request.formData();
    const passt = (await hmac(env.SCHLUESSEL, String(formular.get('passwort') || ''))) === (await hmac(env.SCHLUESSEL, env.ADMIN_PASSWORT));
    if (!passt) return html(anmeldeSeite({ fehler: 'Das Passwort stimmt nicht.' }), 401);
    const bis = Date.now() + SITZUNG_TAGE * TAG;
    const keks = `sitzung=${bis}.${await hmac(env.SCHLUESSEL, `admin|${bis}`)}; Path=/admin; Max-Age=${SITZUNG_TAGE * 86400}; HttpOnly; Secure; SameSite=Strict`;
    return weiter('/admin', { 'set-cookie': keks });
  }

  if (!(await angemeldet(request, env))) return html(anmeldeSeite({}), request.method === 'GET' ? 200 : 401);

  if (pfad === '/admin/abmelden' && request.method === 'POST') {
    return weiter('/admin', { 'set-cookie': 'sitzung=; Path=/admin; Max-Age=0; HttpOnly; Secure; SameSite=Strict' });
  }

  // Gerät freischalten: weiter zur Brixmap, der Schlüssel steht hinter # und geht an keinen Server.
  // Die Seite speichert ihn im Browser und nimmt ihn sofort aus der Adresse.
  if (pfad === '/admin/geraet' && request.method === 'POST') {
    const ziel = new URL('/brixmap/', env.SEITE || 'https://johannesbrix.com');
    ziel.hash = `ich=${await geraeteSchluessel(env)}`;
    return weiter(ziel.toString());
  }

  if (pfad === '/admin/ort' && request.method === 'POST') {
    const f = await request.formData();
    const id = Number(f.get('id'));
    const aktion = f.get('aktion');
    if (aktion === 'freigeben') await env.DB.prepare("UPDATE orte SET status = 'offen' WHERE id = ?").bind(id).run();
    if (aktion === 'speichern') {
      const kategorie = String(f.get('kategorie'));
      await env.DB.prepare('UPDATE orte SET name = ?, kategorie = ?, notiz = ?, von = ? WHERE id = ?')
        .bind(
          text(f.get('name'), 80) || 'Ohne Namen',
          kategorie in KATEGORIEN ? kategorie : 'sonstiges',
          text(f.get('notiz'), 300),
          text(f.get('von'), 40),
          id,
        )
        .run();
    }
    if (aktion === 'loeschen') await env.DB.prepare('DELETE FROM orte WHERE id = ?').bind(id).run();
    return weiter(aktion === 'loeschen' ? '/admin' : `/admin#ort-${id}`);
  }

  if (pfad === '/admin/zaehler' && request.method === 'POST') {
    const f = await request.formData();
    const wert = Math.max(0, Math.floor(Number(f.get('wert')) || 0));
    await env.DB.prepare("UPDATE zaehler SET wert = ? WHERE name = 'klicks'").bind(wert).run();
    return weiter('/admin#zaehler');
  }

  if (pfad === '/admin' && request.method === 'GET') {
    const { results } = await env.DB.prepare('SELECT * FROM orte ORDER BY id DESC LIMIT 2000').all();
    const zaehler = await env.DB.prepare("SELECT wert FROM zaehler WHERE name = 'klicks'").first();
    // „Dieses Gerät freischalten“ leitet zur Website weiter. Browser prüfen auch die Weiterleitung nach
    // einem Formular gegen form-action, deshalb ist hier zusätzlich genau die eigene Website erlaubt.
    const website = new URL(env.SEITE || 'https://johannesbrix.com').origin;
    return html(
      adminSeite({ orte: results, klicks: zaehler?.wert ?? 0, seite: env.SEITE || '', kategorien: KATEGORIEN, pruefen: env.FREIGABE === 'pruefen' }),
      200,
      { 'content-security-policy': SICHERHEIT['content-security-policy'].replace("form-action 'self'", `form-action 'self' ${website}`) },
    );
  }

  return weiter('/admin');
}
