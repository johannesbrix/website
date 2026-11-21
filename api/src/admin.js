// Admin-Seite (/admin): nur HTML und Formulare, kein JavaScript. Alle Texte von Besuchern laufen durch e().

const e = (wert) =>
  String(wert ?? '').replace(/[&<>"']/g, (z) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[z]);

const DATUM = new Intl.DateTimeFormat('de-DE', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Europe/Berlin' });
const datum = (iso) => (iso ? DATUM.format(new Date(iso)) : '');
const ZEICHEN = { neu: '🆕', offen: '💌', besucht: '✅' };

const STIL = `
  :root { color-scheme: light dark; --grund: #fff; --text: #373634; --leise: #6b6965; --linie: #e6e5e2; --flaeche: #f1f1ef; --orange: #fc4c02; }
  @media (prefers-color-scheme: dark) { :root { --grund: #373634; --text: #f5f5f3; --leise: #c2c0bb; --linie: #4d4c49; --flaeche: #42413e; } }
  * { box-sizing: border-box; }
  body { margin: 0; background: var(--grund); color: var(--text); font: 16px/1.5 system-ui, -apple-system, "Segoe UI", sans-serif; }
  main { max-width: 760px; margin: 0 auto; padding: 20px 16px 64px; }
  a { color: inherit; }
  h1 { margin: 0; font-size: 28px; letter-spacing: -0.02em; }
  h2 { margin: 40px 0 12px; font-size: 21px; }
  h3 { margin: 4px 0 0; font-size: 19px; }
  p { margin: 0; }
  .kopf { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 12px; }
  .kopf nav { display: flex; gap: 12px; align-items: center; }
  .ort { padding: 16px; border: 1px solid var(--linie); border-radius: 14px; margin-bottom: 12px; }
  .ort:target { border-color: var(--orange); }
  .meta { display: flex; flex-wrap: wrap; gap: 2px 12px; font-size: 14px; color: var(--leise); }
  .notiz { margin-top: 6px; }
  .kommentar { margin-top: 8px; padding-top: 8px; border-top: 1px solid var(--linie); }
  .klein { margin-top: 6px; font-size: 14px; color: var(--leise); }
  .aktionen { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 12px; align-items: flex-start; }
  form { margin: 0; }
  button { min-height: 44px; padding: 0 18px; border: 0; border-radius: 999px; background: var(--text); color: var(--grund); font: 600 15px system-ui, sans-serif; cursor: pointer; }
  button.leise { background: var(--flaeche); color: var(--text); }
  label { display: grid; gap: 4px; margin-top: 10px; font-size: 14px; font-weight: 600; }
  input, textarea, select { width: 100%; padding: 10px 12px; border: 1px solid var(--linie); border-radius: 10px; background: var(--grund); color: var(--text); font: 16px system-ui, sans-serif; }
  details { margin-top: 10px; }
  summary { cursor: pointer; font-size: 14px; font-weight: 600; min-height: 32px; }
  .leer { color: var(--leise); }
  .fehler { margin: 12px 0; padding: 10px 14px; border-radius: 10px; background: var(--flaeche); }
  .anmelden { max-width: 360px; margin: 18vh auto 0; }
  .anmelden button { margin-top: 14px; width: 100%; }
  .zaehler { display: flex; gap: 8px; align-items: end; }
  .zaehler label { flex: 1; margin: 0; }
`;

const seite = (titel, inhalt) => `<!doctype html>
<html lang="de"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex"><title>${e(titel)}</title><style>${STIL}</style></head>
<body><main>${inhalt}</main></body></html>`;

export function anmeldeSeite({ fehler }) {
  return seite(
    'Brixmap-Admin',
    `<form class="anmelden" method="post" action="/admin/anmelden">
      <h1>Brixmap-Admin</h1>
      ${fehler ? `<p class="fehler" role="alert">${e(fehler)}</p>` : ''}
      <input type="text" name="benutzer" autocomplete="username" value="johannes" hidden>
      <label>Passwort<input type="password" name="passwort" autocomplete="current-password" required autofocus></label>
      <button type="submit">Anmelden</button>
    </form>`,
  );
}

function aktion(id, wert, beschriftung, leise = false) {
  return `<form method="post" action="/admin/ort"><input type="hidden" name="id" value="${id}">
    <button name="aktion" value="${wert}"${leise ? ' class="leise"' : ''}>${beschriftung}</button></form>`;
}

function ortKarte(ort, kategorien) {
  const heute = new Date().toISOString().slice(0, 10);
  const osm = `https://www.openstreetmap.org/?mlat=${ort.lat}&mlon=${ort.lng}#map=17/${ort.lat}/${ort.lng}`;
  const optionen = Object.entries(kategorien)
    .map(([id, name]) => `<option value="${id}"${id === ort.kategorie ? ' selected' : ''}>${e(name)}</option>`)
    .join('');
  let knoepfe = '';
  if (ort.status === 'neu') knoepfe = aktion(ort.id, 'freigeben', 'Freigeben');
  if (ort.status === 'offen') {
    knoepfe = `<details><summary>Als besucht markieren</summary>
      <form method="post" action="/admin/ort"><input type="hidden" name="id" value="${ort.id}">
        <label>Dein Kommentar (erscheint auf der Karte)<textarea name="kommentar" rows="3" maxlength="500"></textarea></label>
        <label>Besucht am<input type="date" name="besucht_am" value="${heute}"></label>
        <div class="aktionen"><button name="aktion" value="besucht">Speichern</button></div>
      </form></details>`;
  }
  if (ort.status === 'besucht') knoepfe = aktion(ort.id, 'offen', 'Zurück auf „offen“', true);
  return `<article class="ort" id="ort-${ort.id}">
    <p class="meta"><span>${ZEICHEN[ort.status] ?? ''} ${e(kategorien[ort.kategorie] ?? ort.kategorie)}</span><span>${e(datum(ort.erstellt))}</span>${ort.von ? `<span>von ${e(ort.von)}</span>` : ''}</p>
    <h3>${e(ort.name)}</h3>
    ${ort.notiz ? `<p class="notiz">${e(ort.notiz)}</p>` : ''}
    ${ort.status === 'besucht' ? `<p class="kommentar">${ort.kommentar ? e(ort.kommentar) : '<span class="leer">Noch kein Kommentar</span>'}<br><span class="klein">Besucht am ${e(datum(ort.besucht_am))}</span></p>` : ''}
    <p class="klein"><a href="${osm}" target="_blank" rel="noopener noreferrer">Auf der Karte ansehen</a> (${ort.lat}, ${ort.lng})</p>
    <div class="aktionen">${knoepfe}</div>
    <details><summary>Bearbeiten</summary>
      <form method="post" action="/admin/ort"><input type="hidden" name="id" value="${ort.id}">
        <label>Name<input name="name" value="${e(ort.name)}" maxlength="80"></label>
        <label>Kategorie<select name="kategorie">${optionen}</select></label>
        <label>Notiz<textarea name="notiz" rows="3" maxlength="300">${e(ort.notiz)}</textarea></label>
        <label>Empfohlen von<input name="von" value="${e(ort.von)}" maxlength="40"></label>
        <label>Dein Kommentar<textarea name="kommentar" rows="3" maxlength="500">${e(ort.kommentar)}</textarea></label>
        <div class="aktionen"><button name="aktion" value="speichern">Speichern</button></div>
      </form></details>
    <details><summary>Löschen</summary>
      <div class="aktionen">${aktion(ort.id, 'loeschen', 'Endgültig löschen', true)}</div></details>
  </article>`;
}

function abschnitt(titel, orte, kategorien, leer) {
  return `<h2>${titel} (${orte.length})</h2>${orte.length ? orte.map((o) => ortKarte(o, kategorien)).join('') : `<p class="leer">${leer}</p>`}`;
}

export function adminSeite({ orte, klicks, seite: adresse, kategorien }) {
  const nach = (status) => orte.filter((o) => o.status === status);
  return seite(
    'Brixmap-Admin',
    `<div class="kopf"><h1>Brixmap-Admin</h1>
      <nav>${adresse ? `<a href="${e(adresse)}/brixmap/">Zur Brixmap</a>` : ''}
        <form method="post" action="/admin/abmelden"><button class="leise">Abmelden</button></form></nav></div>
    ${abschnitt('Neu', nach('neu'), kategorien, 'Keine neuen Empfehlungen.')}
    ${abschnitt('Auf der Karte', nach('offen'), kategorien, 'Noch keine freigegebenen Empfehlungen.')}
    ${abschnitt('Besucht', nach('besucht'), kategorien, 'Noch nichts besucht.')}
    <h2 id="zaehler">Klick-Zähler</h2>
    <form class="zaehler" method="post" action="/admin/zaehler">
      <label>Stand<input type="number" name="wert" min="0" value="${Number(klicks) || 0}"></label>
      <button>Setzen</button>
    </form>`,
  );
}
