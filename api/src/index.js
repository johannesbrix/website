// Kleiner Server für johannesbrix.com (Cloudflare Worker + D1). Einrichtung: docs/brixmap.md
//
// Öffentlich (nur von den Seiten in ERLAUBTE_URSPRUENGE):
//   GET  /klicks   Stand des Klick-Zählers aller Besucher
//   POST /klicks   { anzahl } gebündelte Klicks zählen, mit Grenzen gegen Auto-Klicker
//   GET  /orte     freigegebene Empfehlungen für die Brixmap
//   POST /orte     neue Empfehlung, landet erst einmal in der Warteschlange (status „neu“)
//   GET  /suche?q= Ortssuche über Nominatim (OpenStreetMap), ohne die IP der Besucher weiterzugeben
// Nur für Johannes, mit Passwort:
//   /admin         Empfehlungen freigeben, als besucht markieren, kommentieren, löschen; Zähler korrigieren

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
  wartendeHoechstens: 300, // offene Empfehlungen in der Warteschlange
  suchenProMinute: 20, // pro Besucher
  anmeldungenProStunde: 10, // Fehlversuche am Admin-Login pro Besucher
};
const MINUTE = 60_000;
const STUNDE = 60 * MINUTE;
const TAG = 24 * STUNDE;
const SITZUNG_TAGE = 30;

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

async function orteLesen(request, env) {
  const { results } = await env.DB.prepare(
    "SELECT id, name, kategorie, notiz, von, lat, lng, status, kommentar, besucht_am FROM orte WHERE status IN ('offen', 'besucht') ORDER BY id DESC LIMIT 2000",
  ).all();
  // Kein Cache: Was Johannes freigibt, soll sofort auf der Karte stehen
  return json({ orte: results }, 200, request, env);
}

function empfehlungPruefen(d) {
  const name = text(d.name, 80);
  const notiz = text(d.notiz, 300);
  const von = text(d.von, 40);
  const kategorie = String(d.kategorie ?? '');
  const lat = Number(d.lat);
  const lng = Number(d.lng);
  if (name.length < 2) return { fehler: 'Bitte gib dem Ort einen Namen.' };
  if (!(kategorie in KATEGORIEN)) return { fehler: 'Bitte wähle aus, was es ist.' };
  if (notiz.length < 3) return { fehler: 'Bitte schreib kurz, warum du den Ort empfiehlst.' };
  if (!Number.isFinite(lat) || !Number.isFinite(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180) {
    return { fehler: 'Bitte wähle den Ort auf der Karte.' };
  }
  if (d.einwilligung !== true) return { fehler: 'Bitte bestätige, dass deine Empfehlung veröffentlicht werden darf.' };
  return { name, notiz, von, kategorie, lat: Math.round(lat * 1e5) / 1e5, lng: Math.round(lng * 1e5) / 1e5 };
}

async function ortEmpfehlen(request, env) {
  if (!erlaubterUrsprung(request, env)) return json({ fehler: 'Nicht erlaubt.' }, 403, request, env);
  const daten = await jsonLesen(request);
  if (!daten || typeof daten !== 'object') return json({ fehler: 'Ungültige Anfrage.' }, 400, request, env);
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
  const wartend = await env.DB.prepare("SELECT COUNT(*) AS anzahl FROM orte WHERE status = 'neu'").first();
  if ((wartend?.anzahl ?? 0) >= GRENZEN.wartendeHoechstens) {
    return json({ fehler: 'Gerade warten sehr viele Empfehlungen auf Freigabe. Bitte versuch es in ein paar Tagen nochmal.' }, 429, request, env);
  }
  await env.DB.prepare('INSERT INTO orte (name, kategorie, notiz, von, lat, lng) VALUES (?, ?, ?, ?, ?, ?)')
    .bind(ort.name, ort.kategorie, ort.notiz, ort.von, ort.lat, ort.lng)
    .run();
  return json({ ok: true }, 201, request, env);
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
  const treffer = daten.map((t) => ({
    name: t.name || String(t.display_name).split(',')[0],
    adresse: t.display_name,
    lat: Number(t.lat),
    lng: Number(t.lon),
  }));
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

  if (pfad === '/admin/ort' && request.method === 'POST') {
    const f = await request.formData();
    const id = Number(f.get('id'));
    const aktion = f.get('aktion');
    const heute = new Date().toISOString().slice(0, 10);
    if (aktion === 'freigeben') await env.DB.prepare("UPDATE orte SET status = 'offen' WHERE id = ?").bind(id).run();
    if (aktion === 'besucht') {
      const datum = text(f.get('besucht_am'), 10);
      await env.DB.prepare("UPDATE orte SET status = 'besucht', kommentar = ?, besucht_am = ? WHERE id = ?")
        .bind(text(f.get('kommentar'), 500), /^\d{4}-\d{2}-\d{2}$/.test(datum) ? datum : heute, id)
        .run();
    }
    if (aktion === 'offen') await env.DB.prepare("UPDATE orte SET status = 'offen', besucht_am = NULL WHERE id = ?").bind(id).run();
    if (aktion === 'speichern') {
      const kategorie = String(f.get('kategorie'));
      await env.DB.prepare('UPDATE orte SET name = ?, kategorie = ?, notiz = ?, von = ?, kommentar = ? WHERE id = ?')
        .bind(
          text(f.get('name'), 80) || 'Ohne Namen',
          kategorie in KATEGORIEN ? kategorie : 'sonstiges',
          text(f.get('notiz'), 300),
          text(f.get('von'), 40),
          text(f.get('kommentar'), 500),
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
    return html(adminSeite({ orte: results, klicks: zaehler?.wert ?? 0, seite: env.SEITE || '', kategorien: KATEGORIEN }));
  }

  return weiter('/admin');
}
