# Brixmap und der kleine Server

Die Brixmap (`/brixmap/`) zeigt drei Arten von Orten:

| Pin | Was | Woher |
|---|---|---|
| ☀️ Von mir | Orte aus Beiträgen (mit Link zum Beitrag) und eigene Tipps | Pages CMS: im Beitrag unter „Orte“, oder „Meine Orte (Brixmap)“ |
| 💌 Empfehlung | Orte, die Besucher empfohlen haben, nach Freigabe | Formular „Ort empfehlen“ auf der Karte |
| ✅ Besucht | Empfehlungen, die Johannes besucht hat, mit seinem Kommentar | Admin-Seite |

Die Emojis stehen in `src/lib/brixmap.ts` und lassen sich dort tauschen.

## So läuft eine Empfehlung

1. Ein Besucher tippt auf „Ort empfehlen“, wählt den Ort auf der Karte (antippen, suchen oder „Mein Standort“) und füllt aus: Name, Kategorie, warum, optional seinen Namen, Einwilligung.
2. Die Empfehlung landet in der Warteschlange. Öffentlich ist noch nichts.
3. Johannes öffnet die Admin-Seite, gibt frei oder löscht. Freigegeben erscheint sie sofort als 💌.
4. War er dort: „Als besucht markieren“, Kommentar schreiben. Dann wird aus 💌 ein ✅ mit seinem Kommentar.

## Admin-Seite

- Adresse: `https://<name-des-workers>.<konto>.workers.dev/admin` (steht nach dem Einrichten in `src/lib/dienste.ts` als Basis-Adresse plus `/admin`).
- Nur ein Zugang, mit einem langen Passwort (Secret `ADMIN_PASSWORT`). Die Anmeldung hält 30 Tage, auch am Handy.
- Dort: neue Empfehlungen freigeben oder löschen, als besucht markieren, kommentieren, bearbeiten, den Klick-Zähler korrigieren.
- Keine Benachrichtigung bei neuen Empfehlungen. Einfach ab und zu reinschauen.

## Der Server (Ordner `api/`)

Ein Cloudflare Worker mit einer D1-Datenbank (SQLite), im kostenlosen Tarif.

| Weg | Wofür |
|---|---|
| `GET /klicks`, `POST /klicks` | gemeinsamer Klick-Zähler. Die Seite bündelt Klicks und schickt höchstens 10 pro Anfrage |
| `GET /orte`, `POST /orte` | freigegebene Empfehlungen lesen, neue Empfehlung abgeben |
| `GET /suche?q=` | Ortssuche über Nominatim (OpenStreetMap), nur beim Absenden, nie beim Tippen |
| `/admin` | Admin-Seite (nur HTML-Formulare, kein JavaScript) |

**Schutz gegen Missbrauch** (Werte in `api/src/index.js`, `GRENZEN`):
- Klicks: pro Besucher höchstens 60 Anfragen pro Minute und 500 Klicks pro Tag, alle zusammen höchstens 3000 pro Minute. Mehr wird still nicht gezählt.
- Empfehlungen: pro Besucher 5 pro Stunde und 15 pro Tag, höchstens 300 wartende. Bots erkennt ein verstecktes Feld und die Zeit zum Ausfüllen; sie bekommen ein „Danke“, gespeichert wird nichts.
- Nur Anfragen von den Seiten in `ERLAUBTE_URSPRUENGE` (johannesbrix.com und lokal).
- Admin: 10 Anmeldeversuche pro Stunde, Formulare nur von der Admin-Seite selbst, Sitzung als signiertes HttpOnly-Cookie.
- „Besucher“ heißt: ein täglich wechselnder Hash der IP-Adresse. Die IP selbst wird nie gespeichert, die Hashes löscht der nächtliche Cron.

**Datenschutz:** Die Abschnitte „Brixmap und Klick-Zähler“, „Karte der Brixmap“ und „YouTube-Videos“ in `src/content/seiten/datenschutz.md` beschreiben das. Bei Änderungen am Server dort mitziehen.

## Einrichten (einmalig)

Voraussetzung: ein kostenloses Cloudflare-Konto (dash.cloudflare.com). Beim Anlegen fragt Cloudflare nach einem Namen für die `workers.dev`-Adresse, z. B. `johannesbrix`.

Im Ordner `api/`:

```
npm install
npx wrangler login                      # öffnet den Browser, dort „Allow“
npx wrangler d1 create johannesbrix     # gibt eine database_id aus → in wrangler.toml eintragen
npm run db:live                         # Tabellen anlegen
npx wrangler secret put ADMIN_PASSWORT  # langes Passwort, z. B. aus dem Passwort-Manager
npx wrangler secret put SCHLUESSEL      # lange zufällige Zeichenkette (nur für den Server)
npm run deploy                          # gibt die Adresse aus, z. B. https://johannesbrix-api.johannesbrix.workers.dev
```

Danach die Adresse in `src/lib/dienste.ts` bei `LIVE` eintragen, bauen, committen und pushen. Erst dann zeigt die Seite den gemeinsamen Zähler und das Formular. Ohne Adresse läuft alles ohne Server: Der Zähler zählt nur die eigenen Klicks, und die Brixmap zeigt nur Johannes' Orte.

Änderungen am Server: `npm run deploy` im Ordner `api/`. Er wird nicht automatisch mit der Website veröffentlicht.

## Lokal testen

```
cd api
npm install
npm run db:lokal          # lokale Datenbank anlegen
npm run dev               # Server auf http://localhost:8787
```

Lokale Geheimnisse stehen in `api/.dev.vars` (nicht im Repo):

```
ADMIN_PASSWORT=lokal-testen
SCHLUESSEL=irgendeine-lange-zeichenkette
```

Die Website dazu mit `PUBLIC_API_URL=http://localhost:8787` starten (PowerShell: `$env:PUBLIC_API_URL='http://localhost:8787'; npm run dev`). Admin lokal: http://localhost:8787/admin

## Karte

- Leaflet (npm-Paket, wird mit der Seite ausgeliefert, kein CDN).
- Kartenbilder vom Server der deutschen OpenStreetMap-Community (`tile.openstreetmap.de`, FOSSGIS e.V.). Nicht-kommerzielle Nutzung ist erlaubt, Namensnennung „© OpenStreetMap-Mitwirkende“ steht unten links auf der Karte.
- Die Kartenbilder sind per CSS entsättigt, damit die Emojis leuchten; im Dunkelmodus invertiert.
- Auf der Kartenseite parkt die fliegende Platte unten rechts (`platteParken` im Basis-Layout).
- Mit einem Finger bewegt man die Karte wie in einer App. Das Mausrad zoomt erst nach einem Klick in die Karte, sonst scrollt die Seite.
- Ganze Zoomstufen, damit die Kartenbilder scharf bleiben; `preconnect` zum Kartenserver im Kopf der Seite.
- Lighthouse (Mobil) liegt hier bei rund 85 statt 95: Die Kartenbilder kommen von einem fremden Server und sind das größte Element. Bewusst akzeptiert.

## Später denkbar

- Menschen auf der Karte (👋): nur freiwillig, nur auf Stadt-Ebene, mit Einwilligung und Löschung auf Wunsch. Nicht 🏠, das würde eine Wohnadresse nahelegen.
- Benachrichtigung bei neuen Empfehlungen (Mail oder Push).
- Momente mit Ort auf der Karte.
