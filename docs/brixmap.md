# Brixmap und der kleine Server

Die Brixmap (`/brixmap/`) zeigt zwei Arten von Orten:

| Pin | Was | Woher |
|---|---|---|
| Orange mit Sonne: „Von mir“ | Johannes' Orte | direkt auf der Karte von seinem freigeschalteten Gerät („Ort setzen“, siehe unten); außerdem Orte zu einem Beitrag (Feld „Orte zum Beitrag“ in Pages CMS, mit Link zum Beitrag) |
| Anthrazit mit Rakete: „Empfohlen“ | Orte, die Besucher empfohlen haben. Sie erscheinen sofort | Knopf „Empfehlen“ auf der Karte |

„Besucht“ (weißer Pin mit Haken und Eindruck) gab es bis 22.11.2026; Johannes: zu viel Pflege, und eigene Orte besucht er ja auch. „Meine Orte (Brixmap)“ in Pages CMS (`orte.yml`) gibt es seitdem ebenfalls nicht mehr, weil eigene Orte direkt auf der Karte entstehen.

Arten und Icons stehen in `src/lib/brixmap.ts`, das Aussehen der Pins (`.pin`) in `src/styles/global.css`. Dieselben Pins erscheinen auf der Karte, in der Liste, in den Filter-Chips und auf der Startseite. Keine Emojis (Johannes, 21.11.2026).

## So läuft eine Empfehlung

1. Ein Besucher tippt auf „Empfehlen“. In der Kartenmitte erscheint ein Pin; er schiebt die Karte darunter, bis der Pin sitzt (oder sucht den Ort, oder nimmt „Mein Standort“). Ist die Karte zu weit weg, zoomt „Hier ist es“ erst heran.
2. Im Formular (am Handy ein Sheet von unten): Name, Kategorie, warum, optional sein Name, Einwilligung. „Auf die Karte setzen“.
3. Die Empfehlung steht sofort auf der Karte, die Ortskarte öffnet sich, ein kurzer Hinweis bedankt sich.
4. Johannes löscht, was nicht passt, direkt an der Ortskarte auf seinem freigeschalteten Gerät (oder in der Admin-Seite, dort ist Neues der letzten 7 Tage markiert).

## Johannes' Gerät: Orte setzen und verwalten direkt auf der Karte

Statt Koordinaten aus Google Maps zu kopieren, setzt Johannes seine Orte wie ein Besucher, nur dass sie gleich orange erscheinen. Dazu wird sein Handy einmal freigeschaltet:

1. Admin-Seite öffnen, anmelden, „Dieses Gerät freischalten“.
2. Die Seite springt zur Brixmap und zeigt „Freigeschaltet“. Der Knopf heißt jetzt „Ort setzen“.
3. Ab jetzt auf diesem Gerät: „Ort setzen“; der Pin in der Kartenmitte ist die Sonne. Pin platzieren, Name und Kategorie, Notiz freiwillig. Kein Name und keine Einwilligung nötig.
4. An jeder Ortskarte vom Server erscheint unten „Löschen“ (zweiter Tipp bestätigt). Orte zu Beiträgen liegen im Repo und lassen sich nur im Beitrag ändern.

Technik: Die Admin-Seite stellt einen signierten Geräte-Schlüssel aus (`bis.signatur`, HMAC mit `SCHLUESSEL`, ein Jahr gültig) und leitet zu `SEITE/brixmap/#ich=…` weiter. Der Teil hinter `#` geht an keinen Server; die Seite legt den Schlüssel in `localStorage` (`jb-ich`) und nimmt ihn sofort aus der Adresse. `POST /orte` mit `ich` speichert den Ort mit Status `ich`, `POST /orte/aendern` löscht. Ein neuer `SCHLUESSEL` macht alle Freischaltungen ungültig. Damit die Weiterleitung klappt, erlaubt die Admin-Seite Formulare zusätzlich an die eigene Website (`form-action`).

Die Admin-Seite bleibt trotzdem: einmal pro Gerät zum Freischalten, als Rückfall, falls das Handy weg ist, zum Bearbeiten von Texten und für den Klick-Zähler. Ganz ohne sie ginge Löschen nur noch über die Datenbank-Konsole bei Cloudflare.

**Freigabe doch wieder einschalten:** In `api/wrangler.toml` `FREIGABE = "pruefen"` setzen und den Server neu veröffentlichen. Dann landen neue Empfehlungen erst in „Wartet auf Freigabe“, und das Formular sagt „erscheint, sobald er freigegeben ist“. Datenschutzerklärung dann wieder anpassen.

## Bedienung der Karte

- **Handy:** Titel, darunter die Karte (rund 70 % der Bildschirmhöhe, randlos), darunter die Liste. Unten auf der Karte „Liste“ und „Empfehlen“.
- **Ab 1000 px:** Liste links, Karte rechts, zusammen so hoch wie das Fenster. „Empfehlen“ oben rechts auf der Karte, Zoom-Knöpfe unten rechts (nur mit Maus).
- **Filter-Chips** oben auf der Karte sind zugleich die Legende. Ohne Auswahl sind alle Orte zu sehen; ein Tipp zeigt nur diese Art, ein zweiter wieder alle.
- **Ortskarte** statt Popup: Tipp auf einen Pin (oder einen Eintrag der Liste) öffnet sie unten auf der Karte, kompakt: Art, Name, Kategorie, Notiz höchstens drei Zeilen (Rest nach „Mehr anzeigen“), Route (Google Maps) als Icon oben rechts neben dem Kreuz, bei Johannes' Orten aus Beiträgen „Zum Beitrag“. Escape, das Kreuz oder ein Tipp auf die Karte schließen sie. Der Pin wird dabei größer und rückt bei Bedarf über die Ortskarte.
- **Musik:** Auf der Brixmap fliegt keine Platte, und Tippen auf Karte, Pins oder Filter startet nie Musik (nur der Player im Footer).
- **Adressen:** `/brixmap/?ort=<id>` öffnet einen Ort (so verlinken die Beiträge), `/brixmap/?empfehlen` startet das Empfehlen (Startseite). Die Adresse folgt dem geöffneten Ort, man kann sie also teilen.
- Mit einem Finger bewegt man die Karte wie in einer App. Das Mausrad zoomt in der geteilten Ansicht direkt, darunter erst nach einem Klick in die Karte, damit die Seite weiter scrollt.
- Alle Texte von Besuchern kommen nur per `textContent` auf die Seite.

## Admin-Seite

- Adresse: `https://<name-des-workers>.<konto>.workers.dev/admin` (steht nach dem Einrichten in `src/lib/dienste.ts` als Basis-Adresse plus `/admin`).
- Nur ein Zugang, mit einem langen Passwort (Secret `ADMIN_PASSWORT`). Die Anmeldung hält 30 Tage, auch am Handy.
- Dort: ein Gerät freischalten (siehe oben), Orte löschen und bearbeiten, den Klick-Zähler korrigieren. Abschnitte: „Deine Orte“ und „Empfehlungen“ (die der letzten 7 Tage mit „Neu“).
- Keine Benachrichtigung bei neuen Empfehlungen. Einfach ab und zu reinschauen.

## Der Server (Ordner `api/`)

Ein Cloudflare Worker mit einer D1-Datenbank (SQLite), im kostenlosen Tarif.

| Weg | Wofür |
|---|---|
| `GET /klicks`, `POST /klicks` | gemeinsamer Klick-Zähler. Die Seite bündelt Klicks und schickt höchstens 10 pro Anfrage |
| `GET /orte`, `POST /orte` | Orte lesen, neuen Ort abgeben (die Antwort enthält den neuen Ort, damit er sofort auf der Karte steht; mit Geräte-Schlüssel als Johannes' eigener Ort) |
| `POST /orte/aendern` | nur mit Geräte-Schlüssel: Ort löschen |
| `GET /suche?q=` | Ortssuche über Nominatim (OpenStreetMap), nur beim Absenden, nie beim Tippen; doppelte Treffer fallen weg |
| `/admin` | Admin-Seite (nur HTML-Formulare, kein JavaScript) |

**Schutz gegen Missbrauch** (Werte in `api/src/index.js`, `GRENZEN`):
- Klicks: pro Besucher höchstens 60 Anfragen pro Minute und 500 Klicks pro Tag, alle zusammen höchstens 3000 pro Minute. Mehr wird still nicht gezählt.
- Empfehlungen: pro Besucher 5 pro Stunde und 15 pro Tag, alle zusammen 100 pro Tag, höchstens 2000 auf der Karte. Links und Webadressen werden abgelehnt, damit sich die Karte nicht für Werbung lohnt. Bots erkennt ein verstecktes Feld und die Zeit zum Ausfüllen; sie bekommen ein „Danke“, gespeichert wird nichts.
- Nur Anfragen von den Seiten in `ERLAUBTE_URSPRUENGE` (johannesbrix.com und lokal).
- Admin: 10 Anmeldeversuche pro Stunde, Formulare nur von der Admin-Seite selbst, Sitzung als signiertes HttpOnly-Cookie.
- „Besucher“ heißt: ein täglich wechselnder Hash der IP-Adresse. Die IP selbst wird nie gespeichert, die Hashes löscht der nächtliche Cron.

**Rechtliches:** Johannes ist für die Karte verantwortlich. Erfährt er von einem rechtswidrigen Eintrag (Beleidigung, falsche Behauptung, Werbung), löscht er ihn zügig. Dafür reicht die Admin-Seite.

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

Danach die Adresse in `src/lib/dienste.ts` bei `LIVE` eintragen, bauen, committen und pushen. Erst dann zeigt die Seite den gemeinsamen Zähler und den Knopf „Empfehlen“. Ohne Adresse läuft alles ohne Server: Der Zähler zählt nur die eigenen Klicks, und die Brixmap zeigt nur Johannes' Orte.

Änderungen am Server: `npm run deploy` im Ordner `api/`. Er wird nicht automatisch mit der Website veröffentlicht.

## Lokal testen

```
cd api
npm install
npm run db:lokal          # lokale Datenbank anlegen
npm run dev               # Server auf http://localhost:8787
```

Lokale Geheimnisse stehen in `api/.dev.vars` (nicht im Repo). `SEITE` zeigt lokal auf die Vorschau, damit „Dieses Gerät freischalten“ dorthin führt:

```
ADMIN_PASSWORT=lokal-testen
SCHLUESSEL=irgendeine-lange-zeichenkette
SEITE=http://localhost:4321
```

Die lokale Datenbank aus der Zeit vor dem Status `ich` (22.11.2026) braucht einmal eine Umstellung, weil SQLite die Prüfregel nur beim Neuanlegen ändert: Tabelle `orte` mit der Regel aus `schema.sql` neu anlegen und die Zeilen übernehmen. Die Live-Datenbank wird erst beim Einrichten angelegt und hat die Regel von Anfang an.

Die Website dazu mit `PUBLIC_API_URL=http://localhost:8787` starten (PowerShell: `$env:PUBLIC_API_URL='http://localhost:8787'; npm run dev`). Admin lokal: http://localhost:8787/admin

## Karte

- Leaflet (npm-Paket, wird mit der Seite ausgeliefert, kein CDN).
- Kartenbilder vom Server der deutschen OpenStreetMap-Community (`tile.openstreetmap.de`, FOSSGIS e.V.). Nicht-kommerzielle Nutzung ist erlaubt, die Namensnennung „© OpenStreetMap-Mitwirkende“ steht unten rechts auf der Karte.
- Die Kartenbilder sind per CSS entsättigt, damit die Pins leuchten; im Dunkelmodus invertiert.
- **Haarlinien zwischen den Kacheln** (gemessen am 22.11.2026): Sie entstehen, wenn die Karte nicht auf einem ganzen Gerätepixel beginnt (die Texte darüber haben krumme Höhen). `aufGeraetepixel()` schiebt die Karte deshalb um den Rest (unter einem Pixel) zurecht, auch nach Größenänderung und Schriftladen. Leaflets eigenes Gegenmittel `mix-blend-mode: plus-lighter` ist abgeschaltet, weil es auf ganzen Pixeln helle Linien erzeugt. Ergebnis: sauber bei Pixeldichte 1, 2, 2,625 und 3; bei 125 % Windows-Skalierung bleibt eine kaum sichtbare, leicht hellere Reihe.
- Die Kacheln laden erst, wenn der Ausschnitt mit allen Orten feststeht (Empfehlungen geladen, spätestens nach 1,2 s), damit nicht zuerst ganz Deutschland lädt.
- Auf der Kartenseite fliegt die Platte nicht (`platte="weg"` im Basis-Layout); die Musik läuft weiter.
- Ganze Zoomstufen, damit die Kartenbilder scharf bleiben; `preconnect` zum Kartenserver im Kopf der Seite.
- Lighthouse (Mobil) liegt hier bei rund 88 statt 95: Die Kartenbilder kommen von einem fremden Server und sind das größte Element. Best Practices 96, weil es die Kacheln nicht in doppelter Auflösung gibt. Beides bewusst akzeptiert.

## Später denkbar

- Menschen auf der Karte: nur freiwillig, nur auf Stadt-Ebene, mit Einwilligung und Löschung auf Wunsch. Nichts, was eine Wohnadresse nahelegt.
- Benachrichtigung bei neuen Empfehlungen (Mail oder Push).
- Bei sehr vielen Orten: Pins zusammenfassen (Clustering).
