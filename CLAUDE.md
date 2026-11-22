# johannesbrix.com

Persönliche Website von Johannes Brix. Sie ist Visitenkarte und Schaufenster für seine Projekte und Lebensbereiche: Gourmet, Bauen, Sport, Menschen & Community. Die Seite ist statisch mit Astro gebaut, liegt auf GitHub Pages und ist unter https://johannesbrix.com erreichbar. Sie ist auf Deutsch.

**Das Ziel (Johannes, 21.11.2026):** Wer die Seite besucht, soll sich danach besser fühlen. Jedes Element soll dem Leser etwas geben, nicht nur etwas über Johannes zeigen. Daraus folgen drei Türen in der Navigation: **Projekte** (was ich mache und was ich dabei lerne), **Rise & Shine** (was mich antreibt, vielleicht auch dich) und **Brixmap** (wo wir uns begegnen).

Gewählte Designrichtung: **B „Bild“, überarbeitet**. Sie ist klar, modern und fotonah, mit Familjen Grotesk, Literata und runden Ecken.

Diese Dateien liest du je nach Aufgabe:
- Vor jeder Arbeit an Layout oder Styles: `docs/design.md`. Die visuelle Referenz liegt in `docs/referenz/`: Startseite, Bereichsseite und Beitrag, jeweils als HTML plus Screenshots.
- Vor jeder Arbeit an Inhalten, Schema oder Redaktion: `docs/inhalte.md`.
- Für Hintergrund, Ziele und Entscheidungen: `docs/briefing.md`.
- Für die Reihenfolge der Bauphasen: `docs/bauplan.md`.
- Vor jeder Arbeit an der Brixmap, am Klick-Zähler oder am Server in `api/`: `docs/brixmap.md`.

## Goldene Regeln

1. **Johannes schreibt alle Texte selbst.** Erfinde nie Texte, Zitate, Zahlen, Daten oder Formulierungen in seinem Namen. Wo Text fehlt, setzt du einen sichtbaren Platzhalter in eckigen Klammern, z. B. `[Story folgt]`. In seinen Texten korrigierst du nur eindeutige Tipp- und Rechtschreibfehler und listest jede Korrektur auf.
2. **Nichts Generisches.** Kein KI-Sprech, keine Floskeln, keine Stock- oder KI-Bilder, keine Emojis (Johannes, 21.11.2026: „wirken billig und KI-generiert“) und keine Pfeile (→) an Links oder Buttons. Icons kommen nur aus `src/lib/icons.ts` (Lucide-Linien, Marken von Simple Icons) und ersetzen erklärenden Text, wo das klar genug ist (Menü, Footer, Player). Die Brixmap-Pins sind eigene Kreise mit Lucide-Icon (`.pin` in `global.css`).
3. **Schlicht.** Die Farben sind Anthrazit und Weiß. Orange (#fc4c02) setzt du nur nach den Regeln in `docs/design.md` ein. Im Zweifel lässt du etwas weg.
4. **Hell und dunkel** schalten automatisch über `prefers-color-scheme`. Prüfe immer beide Modi.
5. **Handy zuerst.** Die meisten Besucher kommen über Instagram. Prüfe jede Seite bei 390 px und bei 1440 px Breite.
6. **Keine externen Requests zur Laufzeit.** Schriften sind selbst gehostet, es gibt keine CDNs, keine Einbettungen und keine Cookies. Freigegebene Ausnahmen, alle in der Datenschutzerklärung beschrieben:
   - der eigene Server in `api/` (Cloudflare Worker) für Klick-Zähler und Brixmap
   - Kartenbilder von `tile.openstreetmap.de`, nur auf `/brixmap/`
   - YouTube (`youtube-nocookie.com`), erst nach einem Klick auf Abspielen (Zwei-Klick-Lösung, `Video.astro`)
   Jede neue Ausnahme nur mit Johannes' Okay und mit einem Absatz in `src/content/seiten/datenschutz.md`. GoatCounter wäre eine mögliche weitere.
7. **Privatsphäre.**
   - Bilder kommen nur ohne Metadaten ins Repo, vor allem ohne GPS. Dafür gibt es `npm run bilder`.
   - Gesichter Dritter erscheinen nur verpixelt, und zwar in der Bilddatei selbst, nie per CSS.
   - Es gibt keine Angaben zum Wohnort.
   - Das Repo ist öffentlich: Alles, was einmal committet ist, bleibt in der Git-Historie.
8. **Kleine Schritte.** Nach jeder Änderung läuft `npm run build`. Committen und pushen tust du nur, wenn Johannes es sagt.

## Befehle

- `npm run dev`: Vorschau auf http://localhost:4321
- `npm run build`: Produktions-Build nach `dist/`. Er muss fehlerfrei durchlaufen.
- `npm run preview`: die gebaute Seite lokal ansehen
- `npm run bilder -- <Dateien oder Ordner>`: Bilder aufräumen. Das Skript entfernt Metadaten, verkleinert auf maximal 2400 px an der langen Kante, wandelt nach sRGB um und dreht nach EXIF.

## Stack

- **Astro 7.3** (`~7.3.8` in `package.json`), mit TypeScript. Astro 7.4 braucht Node ≥ 22.22, auf Johannes' Rechner läuft Node 22.19 (Stand 23.10.2026). Nach einem Node-Update (`winget upgrade OpenJS.NodeJS.22`) auf die aktuelle Astro-Version gehen und `@astrojs/markdown-satteri` auf die Version setzen, die Astro mitbringt (`npm ls @astrojs/markdown-satteri`). Content Collections in `src/content.config.ts`, mit dem `glob()`-Loader und dem `file()`-Loader plus `js-yaml`. `z` kommt aus `astro/zod`.
- **Markdown:** Sätteri, Astros Standard-Prozessor, konfiguriert in `astro.config.mjs`. Gerade Anführungszeichen bleiben gerade (keine englischen „Smart Quotes“), HTML-Kommentare landen nicht auf der Seite, und Absätze, die nur aus einem `[Platzhalter]` bestehen, bekommen die Klasse `platzhalter-text`.
- **CSS:** einfaches CSS mit Custom Properties in `src/styles/global.css`, dazu Styles in den einzelnen Komponenten. Kein Tailwind und kein UI-Framework. Klassennamen dürfen deutsch bleiben wie in der Referenz. Das CSS wird ins HTML eingebettet (`build.inlineStylesheets: 'always'`), das spart beim ersten Besuch einen Roundtrip. `.rahmen` nutzt wie die Referenz `box-sizing: content-box`, deshalb kein globales `border-box`. Elemente aus Unterkomponenten (`Foto`, `Status`, `Icon`, `Pin`) und per Skript erzeugte Elemente stylst du mit `:global()`, auch wenn du ihnen per `class=` eine Klasse mitgibst: Sie tragen den Scope der Elternkomponente nicht.
- **Icons:** `src/lib/icons.ts` sammelt alle Icons als SVG-Strings (Lucide, ISC-Lizenz; Simple Icons, CC0; LinkedIn als eigener Pfad). `<Icon name="…" />` schreibt sie direkt ins HTML, ohne fremde Server.
- **Schriften** über Fontsource: `@fontsource-variable/familjen-grotesk` und `@fontsource-variable/literata`, jeweils nur das Latin-Subset. Bis Literata geladen ist, steht `'Literata Ersatz'` (Georgia mit `size-adjust: 106.3%`) da, damit Absätze gleich umbrechen und nichts springt (CLS).
- **Bilder** nur über `astro:assets`. Du nutzt `<Picture>` mit `formats={['avif','webp']}` und responsiven Breiten. Das Porträt im Hero lädt sofort, alle anderen Bilder `loading="lazy"`.
- **JavaScript:** nur kleines Vanilla-JS. Einzige Bibliothek ist Leaflet für die Karte (npm-Paket, nur auf `/brixmap/`). Musik, Plattenteller und fliegende Platte stecken in `src/lib/musik.js` (getestet). Die Musik startet nur über die Platten und den Player, nie über andere Klicks und nie von selbst (Johannes, 22.11.2026). Die fliegende Platte blendet der Platten-Knopf im Footer-Player aus und ein; auf der Brixmap fliegt sie nicht (`<body data-flieger-modus="weg">`, bloß nicht `data-platte`, das ist der Play-Knopf). Dazu kommen Klick-Zähler, Handymenü, Lightbox, Video und Brixmap.
- **Server:** `api/` ist ein Cloudflare Worker mit D1 für den gemeinsamen Klick-Zähler, Brixmap-Empfehlungen, Ortssuche und die Admin-Seite. Er hat ein eigenes `package.json` und wird separat mit `npm run deploy` veröffentlicht. Seine Adresse steht in `src/lib/dienste.ts`; ist sie leer, läuft die Seite ohne ihn. Details: `docs/brixmap.md`.
- **Seitenwechsel:** `<ClientRouter />` aus `astro:transitions` im Basis-Layout, damit die Musik beim Seitenwechsel weiterläuft. Audio und fliegende Platte stecken in `<div transition:persist="musik">`. Jedes Skript, das Elemente der Seite anspricht (Menü, Zähler, Karte), hängt sich an `astro:page-load` und schützt sich gegen doppeltes Anbinden (Fenster-Flag plus `data-bereit`), weil kleine Inline-Skripte bei jedem Seitenwechsel erneut laufen.
- **SEO:** `@astrojs/sitemap`, `robots.txt`, Open-Graph-Tags und JSON-LD `Person` auf der Startseite.
- **Deployment:** GitHub Actions mit `withastro/action` auf GitHub Pages. In `astro.config` gilt `site: 'https://johannesbrix.com'`, ohne `base`.

## Struktur (Soll)

```
src/
  content.config.ts         Schemas, siehe docs/inhalte.md
  content/
    beitraege/*.md          Beiträge und Projekte
    bereiche/*.md           bauen, gourmet, sport, menschen
    seiten/*.md             rise-and-shine, brixmap, impressum, datenschutz
    einstellungen/site.yml        Allgemein: Name, Beschreibung, Links, Song
    einstellungen/startseite.yml  Intro und Porträt
    einstellungen/band.yml        Rise-and-Shine-Band: Überschrift, Text, Klick-Knopf
    einstellungen/zitate.yml
    einstellungen/videos.yml      Videos und Reden für Rise & Shine
    einstellungen/buecher.yml     Bücher für Rise & Shine
    (Momente und orte.yml gibt es seit 22.11.2026 nicht mehr; eigene Orte setzt Johannes auf der Karte)
  assets/bilder/            alle Bilder (Pages CMS lädt hierhin hoch)
  lib/musik.js              Musik, Plattenteller, fliegende Platte
  lib/inhalt.ts             Inhalte laden, sortieren, formatieren
  lib/brixmap.ts            Kategorien und Pin-Arten der Brixmap
  lib/icons.ts              alle Icons (Lucide, Simple Icons)
  lib/dienste.ts            Adresse des Servers in api/
  components/  layouts/  pages/  styles/
public/                     favicon.svg, favicon.ico, apple-touch-icon.png, og.jpg, musik/gypsy-jazz.mp3
api/                        Cloudflare Worker: Klick-Zähler, Brixmap, Admin (docs/brixmap.md)
scripts/bilder.mjs          Bild-Aufräumskript (sharp)
docs/                       Briefing, Design, Inhalte, Bauplan, Brixmap, Referenz
vorlagen/                   Vorlage für neue Beiträge (Weg über Claude Code)
.pages.yml                  Redaktionsoberfläche (Pages CMS)
.claude/skills/beitrag/     Skill /beitrag
```

## Seiten und URLs

| URL | Inhalt |
|---|---|
| `/` | Intro mit Porträt und den drei Türen, „Gerade dran“ (Liste), Rise-and-Shine-Band mit Zitatkarte und Klick-Knopf, Brixmap-Karte, Footer mit Player. Keine Bereichs-Kacheln (Johannes, 22.11.2026) |
| `/projekte/` | alle Beiträge als Kartenraster, Filter-Chips oben: Alle, Gourmet, Bauen, Sport, Menschen |
| `/gourmet/` `/bauen/` `/sport/` `/menschen/` | Projekte gefiltert nach Bereich: Chips, Titel, Untertitel, Intro und Foto, danach die Beiträge als Kartenraster (`docs/referenz/bereich.html`) |
| `/<bereich>/<slug>/` | Beitragsseite wie eine Notion-Seite: Titelbild als Cover, Bereichs-Icon, Titel (passt sich der Breite an), Status und Datum, Story, „Zum Mitnehmen“, „Auf der Brixmap“ |
| `/rise-and-shine/` | Motto-Band mit Zitatkarte und Klick-Knopf, Johannes' Geschichte mit Video, dann wischbare Regale (`Regal.astro`) für Zitate, Videos, Reden (Links zu YouTube) und Bücher; keine Sprungleiste |
| `/brixmap/` | Karte wie eine App mit zwei Arten von Orten: Johannes' Orte (orange, Sonne) und Empfehlungen (anthrazit, Rakete, erscheinen sofort). „Besucht“ gibt es nicht (Johannes, 22.11.2026). Ortskarte statt Popup, Empfehlen mit Pin in der Kartenmitte und Formular als Sheet. Am Handy Karte über der Liste, ab 1000 px Liste links, Karte rechts. Johannes' freigeschaltetes Gerät setzt eigene Orte (Pin in der Mitte ist dann die Sonne) und löscht direkt an der Ortskarte (`docs/brixmap.md`) |
| `/impressum/` `/datenschutz/` | Rechtliches aus `src/content/seiten/` |
| `/404` | freundliche Fehlerseite mit Link zur Startseite |

Den Blog verlinkst du auf Substack, den Lebenslauf auf LinkedIn. Beides gibt es nicht doppelt auf der Seite.

## Inhaltsregeln, kurz

Die Details stehen in `docs/inhalte.md`.

- **`entwurf: true`:** Der Eintrag erscheint nirgends, auch nicht in der Sitemap.
- **„Gerade dran“** auf der Startseite zeigt Beiträge mit `aktiv: true`, sortiert nach der letzten Aktivität (das neueste Datum aus `datum` und den `updates`), höchstens sechs.
- **Leere Felder:** Pages CMS speichert sie oft als `""` oder `null`. Das Schema muss das als „nicht gesetzt“ behandeln, statt den Build abzubrechen.
- **Bildpfade** im Frontmatter sind relativ und lauten immer `../../assets/bilder/…`. Deshalb liegen alle Inhaltsdateien genau zwei Ebenen unter `src/`.

## Fertig heißt

- `npm run build` läuft grün, und die Browser-Konsole zeigt keine Fehler.
- Die Seite ist bei 390 px und 1440 px Breite geprüft, jeweils hell und dunkel. Du vergleichst sie mit `docs/referenz/*.png` und nutzt dafür bei Bedarf Playwright-Screenshots.
- Die Seite ist per Tastatur bedienbar und zeigt einen sichtbaren Fokus. Alle Bilder haben Alt-Texte. Text hat mindestens 4,5:1 Kontrast.
- `prefers-reduced-motion` wird respektiert.
- Musik und fliegende Platte verhalten sich wie in `docs/design.md` beschrieben, auch nach einem Seitenwechsel.
- Lighthouse auf Mobil: Performance, Barrierefreiheit und SEO liegen jeweils bei mindestens 95. Bewusste Ausnahme: `/brixmap/` erreicht in der Performance rund 88 (Best Practices 96), weil die Kartenbilder von einem fremden Server das größte Element sind. Stand 22.11.2026: alle anderen Seiten 98 bis 100, Barrierefreiheit überall 100.
