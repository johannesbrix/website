# Design: Richtung B „Bild“, überarbeitet

Johannes hat diese Richtung am 17.10.2026 gewählt und mit Notizen verfeinert.

Die visuelle Referenz liegt in `docs/referenz/`:
- `startseite.html`, `bereich.html`, `beitrag.html`
- Screenshots: `startseite-desktop-hell.png`, `startseite-desktop-dunkel.png`, `startseite-handy-dunkel.png`, `startseite-handy-hell.png`, `bereich-desktop-hell.png`, `bereich-handy-hell.png`, `beitrag-handy-hell.png`, `beitrag-desktop-hell.png`

Wenn diese Datei und die Referenz sich widersprechen, gilt diese Datei.

## Idee in einem Satz

Klar, modern und fotonah, im Gefühl ähnlich wie bei Ali Abdaal. Die Fotos tragen die Seite, eine kräftige Grotesk führt, und ein einziges oranges Detail zieht sich durch alles: der Punkt, die „Sonne“ aus *Rise and Shine*.

## Prinzipien

1. **Bilder führen.** Johannes' Fotos bleiben farbig und unbearbeitet. Sie bekommen runde Ecken und keine Filter.
2. **Klare Grotesk für alles Funktionale und für Überschriften.** Eine warme Leseschrift (Literata) setzt du für längere Texte und Untertitel ein.
3. **Orange nur als Signal:**
   - der Punkt nach „JB“
   - der Punkt am Ende des Intros und nach „Rise and Shine“
   - der Status „Läuft“
   - Hover-Unterstreichungen
   - der Fokusring
   - die Spindel des Plattentellers
   - das neueste Update einer Beitragsseite
   - **ein** voller oranger Knopf: der Klick-Knopf im Rise-and-Shine-Band
4. **Zwei Darstellungen für zwei Zwecke:**
   - „Gerade dran“ (und „Mehr aus …“) ist eine **Liste**.
   - Bereiche und Beiträge auf Bereichsseiten sind ein **Raster** aus Kacheln bzw. Karten.
   - So trennen sich die Abschnitte schon visuell. Das war Johannes' Wunsch.
5. **Struktur nur, wo sie Information trägt.** Verboten sind:
   - Großbuchstaben-Labels über Überschriften
   - nummerierte Abschnitte
   - Schatten
   - Verlaufsflächen als Deko
   - Pfeile an Links
6. **Bewegung nur auf Aktion.** Von selbst bewegen sich nur die aufgehende Sonne im Intro und die fliegende Platte (Johannes' Easter Egg).

## Farben (Tokens)

Die Tokens liegen auf `:root`. Der Dunkelmodus kommt per `@media (prefers-color-scheme: dark)`.

| Token | Hell | Dunkel | Verwendung |
|---|---|---|---|
| `--grund` | `#ffffff` | `#373634` | Hintergrund |
| `--text` | `#373634` | `#f5f5f3` | Text; auch Hintergrund des Rise-and-Shine-Bands (invertiert) |
| `--leise` | `#6b6965` | `#c2c0bb` | Sekundärtext (Kontrast ≥ 5,4:1) |
| `--linie` | `#e6e5e2` | `#4d4c49` | Haarlinien |
| `--flaeche` | `#f1f1ef` | `#42413e` | Bild-Platzhalter, Menü-Button, Menü-Hintergrund |
| `--orange` | `#fc4c02` | `#fc4c02` | Punkte, Unterstreichungen, Fokus, Klick-Knopf |

- Das Anthrazit `#373634` stammt aus Johannes' Branding-Kit. Hell und dunkel tauschen die Rollen.
- Orange hat auf beiden Gründen etwa 3,2 bis 3,5:1 Kontrast. Deshalb **nie für Fließtext**. Ausnahme ist der Klick-Knopf: weiße Schrift in **19 px fett** auf Orange. Das zählt als große Schrift, 3:1 reicht dort. Kleiner darf die Schrift nicht werden.
- `color-scheme: light dark` setzen.

## Radien

| Token | Wert | Wofür |
|---|---|---|
| `--r-gross` | 20 px | Porträt, Titelbild, Bereichsfoto |
| `--r` | 14 px | Kacheln, Karten |
| — | 12 px (Handy: 10 px) | Vorschaubilder in Listen |
| `--r-klein` | 10 px | Galerie |
| Pill | 999 px bzw. halbe Höhe | Buttons (Menü, Klick-Knopf) |

Auf dem Handy läuft das Porträt im Hero randlos über die volle Breite und hat dort keinen Radius.

## Typografie

| Rolle | Schrift | Details |
|---|---|---|
| Überschriften, Intro, Navigation, UI, Listen | **Familjen Grotesk** (Variable, `wght` 400 bis 700) | 500 für das Intro, 600 für Überschriften und Namen, 700 für große Titel und das Logo |
| Lesetext, Untertitel, Rise-and-Shine-Text | **Literata** (Variable, `opsz` + `wght`) | aufrecht für Lesetext, kursiv für Untertitel |

Fallbacks:
- `"Familjen Grotesk", "Helvetica Neue", Arial, sans-serif`
- `"Literata", Georgia, serif`

Die Schriften lädst du per Fontsource und nur im Latin-Subset. Familjen Grotesk wird vorgeladen.

| Element | Größe (fluid) | Gewicht | Zeilenhöhe | Laufweite |
|---|---|---|---|---|
| Logo „JB“ | 27 px | 700 | – | −0.045em |
| Intro (Hero) | `clamp(29px, 3.5cqi, 50px)` | 500 | 1.1 | −0.025em |
| „Rise and Shine“ | `clamp(58px, 10.5cqi, 168px)` | 700 | 0.92 | −0.05em |
| Bereichstitel (h1) | `clamp(58px, 9cqi, 132px)` | 700 | 0.92 | −0.05em |
| Beitragstitel (h1) | `clamp(50px, 8cqi, 116px)` | 700 | 0.94 | −0.05em |
| Abschnittstitel (h2) | `clamp(24px, 2.4cqi, 32px)` | 600 | 1.15 | −0.02em |
| Kachelname (Bereich) | `clamp(22px, 2.6cqi, 34px)` | 600 | 1.1 | −0.03em |
| Kartenname / Listenname | `clamp(20px, 2cqi, 26px)` | 600 | 1.15 | −0.02em |
| Untertitel (Literata kursiv) | `clamp(20px, 2cqi, 26px)` | 400 | 1.35 | 0 |
| Lesetext (Literata) | `clamp(18px, 1.6cqi, 20px)` | 400 | 1.65 | 0 |
| Rise-and-Shine-Text (Literata) | `clamp(19px, 1.8cqi, 23px)` | 400 | 1.55 | 0 |
| UI-Text | 15 bis 17 px | 400 bis 600 | 1.5 | 0 |
| Kleingedrucktes, Meta | 13 bis 14 px | 400 bis 600 | 1.4 | 0 |

- Lesetext hat höchstens 680 px Breite.
- Überschriften und Absätze bekommen `text-wrap: pretty`.
- `cqi` bezieht sich auf den Seiten-Container (`container-type: inline-size`). Alternativ geht `vw` mit Media Queries; wichtig ist, dass das Ergebnis der Referenz entspricht.

## Layout

- **Rahmen:** `max-width: 1280px`, mittig, Seitenabstand `clamp(20px, 4.4cqi, 64px)`.
- **Breakpoint:** 760 px.
- **Ausrichtung:** linksbündig.
- **Abschnittsabstand:** `clamp(48px, 7cqi, 104px)`.

**Kopfzeile**
- 84 px hoch, links „JB“ plus Punkt.
- Rechts die Navigation (Familjen Grotesk 16/500): Gourmet, Bauen, Sport, Menschen, Rise & Shine.
- Aktive Seite und Hover bekommen eine orange Unterstreichung (2 px, Offset 7 px).
- Unter 760 px gibt es eine Pill „Menü“ auf `--flaeche`, 44 px hoch. Sie öffnet ein Vollbild-Menü mit großen Links (Familjen Grotesk 600, rund 36 px) und den Plattform-Links. Bedienung: Escape schließt, der Fokus bleibt im Menü gefangen, `aria-expanded` ist gesetzt.

**Hero (Startseite)**
- Grid `5fr / 6fr`: links das Porträt (4:5, `--r-gross`, `object-position: 50% 40%`), rechts das Intro, vertikal mittig.
- Handy: das Porträt randlos oben, darunter das Intro.

## Komponenten

**Der Punkt**
- Ein Kreis: `.2em`, rund, `--orange`, `margin-left: .05em`, auf der Grundlinie.
- Er ersetzt den Schlusspunkt des Intros (im Code das letzte „.“ des Texts aus `site.yml`) und steht nach „Rise and Shine“ und nach „JB“.

**Aufgehende Sonne**
- Nur der Punkt im Intro bewegt sich: von `translateY(.6em)` und Deckkraft 0 auf die Endposition.
- Dauer 1,6 s, Verzögerung 0,5 s, `cubic-bezier(.2,.75,.25,1)`.
- Bei Reduced Motion gibt es keine Animation.

**Status**
- Text 15/500 plus ein Punkt von 9 px.
- **Läuft:** Punkt gefüllt in Orange.
- **Geplant:** Ring, Text in `--leise`.
- **Fertig:** Punkt gefüllt in `--text`.
- **Pausiert:** Ring, `--leise`.

**Projektliste** („Gerade dran“ auf der Startseite und „Mehr aus *Bereich*“ auf Beitragsseiten)
- Grid: Vorschau 148 px (4:3, Radius 12 px) | Name plus Zeile | Status rechts. Maximal 1000 px breit, Abstand 14 bis 22 px.
- Name: Familjen Grotesk 600.
- Zeile darunter: Bereich (500), daneben die Tags (`--leise`), mit 12 px Abstand, ohne Trennzeichen. In „Mehr aus …“ entfällt der Bereich.
- Handy: Vorschau 104 px (Radius 10 px) links über zwei Zeilen, der Status steht unter dem Namen.
- Hover: Der Name wird unterstrichen (orange, 2 px).

**Bereichs-Kacheln** (Startseite)
- Raster `repeat(auto-fit, minmax(min(150px, 100%), 1fr))`. Das ergibt am Desktop 4 Spalten und am Handy 2.
- Jede Kachel: quadratisches Foto (`--r`), darunter der Name (600) und der **Untertitel** aus dem Bereich (15 px, `--leise`).
- Untertitel heute:

| Bereich | Untertitel |
|---|---|
| Gourmet | Brot, Kochen, Restaurants |
| Bauen | Leidenschaftsprojekte |
| Sport | Laufen, Functional Fitness, Hyrox und Co. |
| Menschen & Community | Leute zusammenbringen |

**Rise-and-Shine-Band** (Startseite und Seite `/rise-and-shine/`)
- Volle Breite, Hintergrund `--text`, Schrift `--grund`, also invertiert. Im Dunkelmodus ist das Band hell.
- Darin: „Rise and Shine“ plus Punkt, darunter `motto_text` in Literata (höchstens 36em breit, Deckkraft .88).
- Darunter der **Klick-Knopf**: Text aus `site.yml → klick.knopf`, aktuell „Wenn du mich klickst, wird dein Tag garantiert besser!“.
  - Orange Fläche, weiße Schrift, Familjen Grotesk 700, 19 px.
  - Mindestens 58 px hoch, Padding 14/28 px, Radius 29 px.
  - Der Text darf umbrechen und ist linksbündig.
  - Hover: `brightness(1.07)`. Active: `scale(.98)`.
- Daneben bzw. am Handy darunter: der Zähler „**Y× geklickt**“ (17/500, `tabular-nums`, `aria-live="polite"`).
  - **v1:** Y zählt die Klicks dieses Besuchers, gespeichert in `localStorage`, umschlossen von try/catch.
  - **Option für später:** ein globaler Zähler über alle Besucher, siehe Briefing.
- Darunter das **Zitat**: Jeder Klick zeigt das nächste Zitat aus `zitate.yml`, der Reihe nach und nach dem letzten wieder von vorn. Vor dem ersten Klick steht dort nichts.
  - Ein `<figure aria-live="polite">`, 26 bis 40 px Abstand zum Knopf, höchstens 34em breit.
  - Zitat in Literata kursiv, 20 bis 26 px, `text-wrap: balance`, in deutschen Anführungszeichen „…“.
  - Darunter `von` in Familjen Grotesk 14/500, Deckkraft .75. Fehlt `von`, entfällt die Zeile.

**Plattenteller und fliegende Platte**

Song: „Gypsy Jazz“ von Aurec (Pixabay Content License), `public/musik/gypsy-jazz.mp3`, 2:15 Minuten, läuft in Schleife. Die Angaben stehen in `site.yml` unter `plattenteller`.

Die ganze Logik steckt in **`src/lib/musik.js`**. Das Skript ist fertig und getestet, auch mit Seitenwechseln über den ClientRouter. Du baust nur HTML und CSS dazu und änderst das Skript nur, wenn Johannes es will. Referenz: `docs/referenz/*.html` sowie die Screenshots `startseite-*-flieger.png`.

*Footer-Platte*
- Ein `<button data-platte>` mit 88 px. Das `aria-label` („Song abspielen“ bzw. „Song anhalten“) setzt das Skript.
- Aufbau: eine Scheibe mit Rillen (`repeating-radial-gradient`), das Etikett (Johannes' Gesicht, 50 %, rund) und eine orange Spindel von 7 px. Darüber liegt ein statischer Glanz (`conic-gradient`), der sich nicht mitdreht.
- Text daneben in `<p data-platte-text>`:
  - „Zum Abspielen tippen“
  - beim Abspielen „Läuft: Gypsy Jazz – Aurec“. Das setzt das Skript aus `data-titel` und `data-interpret` am Audio-Element.
  - ohne Song: „Zum Drehen tippen“

*Fliegende Platte (Easter Egg)*
- Dieselbe Platte in klein: 64 px, am Handy 52 px, Spindel 6 px. `position: fixed`, weicher Schatten `0 10px 28px rgba(0,0,0,.28)`, `z-index` unter dem Handymenü, beim Drucken ausgeblendet.
- Sie fliegt schräg mit 70 bis 140 px/s über den Bildschirm und prallt an den Rändern ab wie ein Pingpongball.
- Antippen schaltet um wie bei der Footer-Platte: Läuft die Musik, halten Musik und Platte an, und die Platte bleibt an ihrer Stelle stehen. Läuft sie nicht, startet der Tipp die Musik, und beide Platten drehen sich.
- Sie sitzt im Basis-Layout, also auf jeder Seite, direkt nach dem Skip-Link. So erreicht man sie per Tastatur sofort.
- Abschaltbar mit `plattenteller.fliegende_platte: false`, auch in Pages CMS. Dann gibt es auch kein Autoplay, die Musik startet nur über die Footer-Platte.

*Verhalten*
- Beim Laden versucht die Seite, die Musik zu starten. Browser erlauben Ton meist erst nach der ersten Berührung. Dann startet sie beim ersten Tippen, Klicken oder Tastendruck irgendwo auf der Seite und blendet in 0,8 s auf 60 % Lautstärke ein. Wischen zum Scrollen startet nichts.
- Footer-Platte und fliegende Platte steuern dieselbe Musik.
- Beide Scheiben drehen sich nur, solange Musik läuft, mit 1,8 s pro Umdrehung. Anhalten friert Drehwinkel und Song-Position ein, Weiterspielen macht genau dort weiter.
- Beim Seitenwechsel läuft alles weiter. Dafür sorgen `<ClientRouter />` im Layout und `transition:persist="musik"` um Audio und fliegende Platte.
- Der Browser merkt sich „angehalten“ und die Position der Platte (localStorage). Wer sie anhält, wird beim nächsten Besuch nicht wieder überrascht. Song-Position und Winkel gelten für die Sitzung (sessionStorage).
- Reduced Motion: Nichts fliegt und nichts dreht sich. Die Platte parkt unten rechts und bleibt der Schalter. Die Musik verhält sich gleich.
- `preload="none"`: Die 2 MB laden erst, wenn die Musik startet.
- Ohne Song in `site.yml` gibt es keine fliegende Platte, und die Footer-Platte dreht sich beim Tippen nur.

So sieht das im Basis-Layout aus:

```astro
<a class="skip" href="#inhalt">Zum Inhalt springen</a>
{song.datei && (
  <div transition:persist="musik">
    <audio data-song src={song.datei} data-titel={song.titel} data-interpret={song.interpret}
           loop preload="none"></audio>
    {song.fliegende_platte && (
      <button class="flieger" data-flieger type="button" aria-label="Platte und Musik anhalten">
        <span class="scheibe"><Image class="etikett" … alt="" /><span class="spindel"></span></span>
        <span class="glanz"></span>
      </button>
    )}
  </div>
)}
…
<script>import '../lib/musik.js';</script>
```

**Footer**
- Grid: Plattenteller | Links rechtsbündig (Familjen Grotesk 600, 19 px): Instagram, Strava, Blog auf Substack, Lebenslauf auf LinkedIn.
- Darunter klein: Impressum, Datenschutz, © Jahr Johannes Brix.
- Leere Links lässt du weg. Am Handy steht alles untereinander.

**Bereichsseite** (siehe `bereich.html`)
1. Kopf als Grid `6fr / 5fr`. Links:
   - Titel (700, riesig)
   - Untertitel (Literata kursiv, `--leise`)
   - Intro (Literata 18 bis 20 px, höchstens 34em)

   Rechts das Bereichsfoto (4:3, `--r-gross`). Am Handy steht alles untereinander.
2. „Beiträge“ (h2), darunter ein **Kartenraster** `repeat(auto-fill, minmax(min(300px, 100%), 1fr))`: am Desktop 3 Spalten, am Handy 1.
3. Jede Karte:
   - Bild 4:3 (`--r`)
   - Meta-Zeile (14 px): Status plus Datum der letzten Aktivität, z. B. „17. Okt. 2026“
   - Name (600)
   - Tags (`--leise`)

   Sortiert wird nach letzter Aktivität.
4. Nur auf `/menschen/`: danach „Momente“ als Liste mit Titel, Datum und dem ersten Satz.
5. Leerer Zustand: „Noch keine Beiträge.“

**Beitragsseite** (siehe `beitrag.html`; Johannes: „Das Template sieht top aus!“)
1. Zurück-Link mit dem Bereichsnamen (15/500, `--leise`).
2. Titel (700, riesig).
3. Tags.
4. Fakten als `<dl>`: Status, Zeitraum, Bereich (Label 13 px `--leise`, Wert 16/600). Fehlende Werte lässt du weg.
5. Titelbild 3:2 (`--r-gross`) mit optionaler Bildunterschrift (14 px `--leise`).
6. Story in Literata 18 bis 20 px, höchstens 680 px breit.
7. „Updates“, das Neueste zuerst: Datum 14/600 (das neueste mit orangem Punkt), darunter der Text in Literata 18 px, optional mit Bild (`--r`).
8. „Bilder“ als Galerie: 3 Spalten, quadratisch, `--r-klein`, Abstand 8 bis 14 px. Ein Klick öffnet das Bild groß in einem `<dialog>` mit Escape und Schließen-Button.
9. „Mehr aus *Bereich*“ als Projektliste mit bis zu 3 Einträgen.
10. Footer.

Leere Abschnitte erscheinen gar nicht, auch nicht ihre Überschrift.

**Momente**
- Übersicht: Liste mit Titel (600, 26 px), Datum und dem ersten Satz in Literata.
- Einzelseite: wie die Beitragsseite, aber ohne Fakten, Updates und Galerie.

**Rise & Shine** (Seite)
- Oben das Band wie auf der Startseite, mit Text und Klick-Knopf.
- Darunter Johannes' Text aus `seiten/rise-and-shine.md` (Literata).
- Dann die Zitate: Literata 24 bis 30 px, `text-wrap: balance`, darunter die Quelle in Familjen Grotesk 14 px. Zwischen den Zitaten liegt viel Luft.

**404**
- „Diese Seite gibt es nicht.“ und ein Link „Zur Startseite“.

## Bilder

- Immer über `<Picture>` mit AVIF und WebP. Breiten:
  - Porträt 480/800/1200
  - Titel- und Bereichsbild 800/1200/1600
  - Karten und Kacheln 300/600
  - Listenvorschau 160/320
- Seitenverhältnisse erzwingst du per `aspect-ratio` und `object-fit: cover`.
- Alt-Text kommt aus dem Inhalt.
- Keine Filter, keine Overlays, kein Text auf Fotos.
- Ohne Bild: eine ruhige `--flaeche`-Fläche ohne Text. Das Wort „Foto“ steht nur in der Referenz.

## Barrierefreiheit

- Ein Skip-Link „Zum Inhalt springen“.
- Landmarks und genau ein `h1` pro Seite. Auf der Startseite ist das `h1` visuell versteckt: „Johannes Brix“.
- Fokus: `outline: 2px solid var(--orange); outline-offset: 3px`.
- Klickflächen sind mindestens 44 px groß.
- Musik, die von selbst startet, muss sich anhalten lassen (WCAG 1.4.2). Das leisten die fliegende Platte und die Footer-Platte.
- `lang="de"`.

## Ergänzungen vom 21.11.2026

Ziel: Wer die Seite besucht, soll sich danach besser fühlen. Jedes Element gibt dem Leser etwas.

- **Navigation:** drei Türen, Projekte · Rise & Shine · Brixmap. Unter 760 px wie bisher das Handymenü, jetzt mit Impressum und Datenschutz am Ende.
- **Chips** (`.chip` in `global.css`): Pillen mit feiner Linie, aktiv gefüllt in `--text`. Für Filter (Projekte, Brixmap) und die Sprungleiste auf Rise & Shine.
- **Pill-Knöpfe** (`.pill`): `--text` als Fläche, `.pill.leise` auf `--flaeche`. Der einzige orange Knopf bleibt der Klick-Knopf.
- **Projekte:** Chips oben, dann der große Titel, dann das Kartenraster. Unter „Alle“ steht der Bereich in der Meta-Zeile der Karte. Die Bereichsseiten sind die gefilterten Ansichten.
- **Zum Mitnehmen** (Beitragsseite, unter der Story): Fläche `--flaeche`, `--r`, Titel 14/600 mit orangem Punkt (8 px), Text in Literata 19–22 px. Neuer erlaubter Einsatz von Orange: dieser Punkt.
- **Rise & Shine:** Band, Sprungleiste, „Warum Rise and Shine“ (Geschichte links, Video rechts, am Handy untereinander), Zitate, Videos, Bücher.
- **Video** (`Video.astro`): 16:9, Fläche `#1b1b1a`, Titel unten links, weißer Play-Kreis in der Mitte, Hinweis „Beim Abspielen lädt das Video von YouTube.“ Kein Vorschaubild von YouTube. Darunter Kanal, „Auf YouTube ansehen“, „Datenschutz“.
- **Zitatfeld unter dem Klick-Knopf:** fester Platz in der Höhe des längsten Zitats, damit nichts springt. Neues Zitat blendet in 0,35 s ein (nicht bei Reduced Motion).
- **Brixmap:** Karte fast bildschirmhoch und randlos, Kacheln entsättigt (im Dunkelmodus invertiert), Pins als Emoji in weißem Kreis mit feiner Linie. Popups ohne Schatten, mit Linie. Ausnahme von „keine Emojis“: die Pins ☀️ 💌 ✅ und ihre Chips.
- **Fliegende Platte:** Steht sie, erscheint daneben die Pille „Ausblenden“. Im Footer unter dem Plattenteller der Schalter „Fliegende Platte ausblenden / zeigen“. Auf der Brixmap parkt sie unten rechts.

## Nicht tun

- keine Emojis, Icon-Sammlungen oder Pfeile
- keine Großbuchstaben-Labels
- keine Mittelpunkte als Trenner
- keine Schatten, keine Verläufe als Deko, kein Glassmorphism. Einzige Ausnahme ist der Schatten der fliegenden Platte, damit sie sichtbar über dem Inhalt schwebt.
- keine Scroll-Animationen, keine Fade-ins pro Abschnitt
- kein Orange als Fläche außer dem Klick-Knopf, kein oranger Fließtext
- keine Stock- oder KI-Bilder
- keine zusätzlichen Abschnitte, Texte oder Zahlen ohne Johannes' Okay
