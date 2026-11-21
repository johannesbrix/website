# Inhalte und Redaktion

Diese Datei ist das Handbuch für Johannes und für Claude Code. Sie erklärt, welche Inhalte es gibt, wie sie aufgebaut sind und wie neue dazukommen.

## Überblick

| Sammlung | Ordner / Datei | Wofür |
|---|---|---|
| Beiträge | `src/content/beitraege/<slug>.md` | Projekte (mit Status) und einzelne Beiträge, z. B. ein Brot oder ein Restaurant |
| Bereiche | `src/content/bereiche/<slug>.md` | die vier Lebensbereiche: Intro, Foto, Reihenfolge |
| Momente | `src/content/momente/<slug>.md` | kurze Geschichten über Begegnungen mit Menschen |
| Seiten | `src/content/seiten/<slug>.md` | `rise-and-shine` (deine Geschichte), `brixmap` (Einleitung der Karte), `impressum`, `datenschutz` |
| Einstellungen | `src/content/einstellungen/site.yml` | Name, Intro, Porträt, Motto-Text, Links, Song, Klick-Knopf |
| Zitate | `src/content/einstellungen/zitate.yml` | Sprüche und Zitate für „Rise and Shine“ |
| Videos | `src/content/einstellungen/videos.yml` | Videos für „Rise and Shine“ (Zwei-Klick-Lösung) |
| Bücher | `src/content/einstellungen/buecher.yml` | Bücher für „Rise and Shine“ |
| Meine Orte | `src/content/einstellungen/orte.yml` | deine eigenen Tipps für die Brixmap (☀️) |
| Empfehlungen | Server in `api/` | Orte, die Besucher empfehlen; Freigabe auf der Admin-Seite, siehe `docs/brixmap.md` |

- Bilder liegen in `src/assets/bilder/`, gern in Unterordnern pro Projekt (`src/assets/bilder/sauna/…`).
- Im Frontmatter steht der Pfad immer relativ: `../../assets/bilder/sauna/titel.jpg`.
- Musik liegt in `public/musik/`.
- Der **Slug** ist der Dateiname: `sauna.md` ergibt `/bauen/sauna/`. Er wird klein geschrieben, ohne Umlaute und mit Bindestrichen (`grosses-brot.md`).

## Beiträge: Felder

| Feld | Pflicht | Werte | Bedeutung |
|---|---|---|---|
| `titel` | ja | Text | Überschrift |
| `datum` | ja | `YYYY-MM-DD` | Erstellt bzw. Start |
| `bereich` | ja | `gourmet` · `bauen` · `sport` · `menschen` | ordnet den Beitrag einer Bereichsseite zu |
| `tags` | – | Liste | worum es geht, z. B. `[Selbstbau, Holz]` |
| `status` | – | `geplant` · `laeuft` · `fertig` · `pausiert` | nur bei Projekten; Anzeige: Geplant / Läuft / Fertig / Pausiert |
| `zeitraum` | – | Text | z. B. „seit Oktober 2026“ |
| `aktiv` | – | `true` / `false` (Standard `false`) | `true` zeigt den Beitrag auf der Startseite unter „Gerade dran“. Das Feld selbst ist nirgends sichtbar |
| `titelbild` | – | Bildpfad | Hauptbild |
| `titelbild_alt` | – (empfohlen) | Text | Was ist zu sehen? Für Screenreader und Google |
| `bildunterschrift` | – | Text | erscheint unter dem Titelbild |
| `mitnehmen` | – (empfohlen) | Text | „Zum Mitnehmen“: 1–2 Sätze, was der Leser für sich mitnehmen kann. Steht hervorgehoben unter der Story |
| `orte` | – | Liste aus `name`, `koordinaten`, `notiz?` | erscheinen mit ☀️ auf der Brixmap, mit Link zum Beitrag. `koordinaten` als `"48.13743, 11.57549"` (aus Google Maps kopiert) |
| `updates` | – | Liste aus `datum`, `text`, `bild?`, `bild_alt?` | Bautagebuch; angezeigt wird das Neueste zuerst |
| `galerie` | – | Liste aus `bild`, `alt?` | zusätzliche Bilder |
| `entwurf` | – | `true` / `false` | `true` heißt nicht veröffentlicht |
| *(Text)* | – | Markdown | die Story |

Die **letzte Aktivität** eines Beitrags ist das neueste Datum aus `datum` und allen `updates[].datum`. Danach wird überall sortiert.

### Beispiel

```markdown
---
titel: Sauna
datum: 2026-10-17
bereich: bauen
tags: [Selbstbau]
status: geplant
zeitraum: "[Zeitraum]"
aktiv: true
titelbild: ../../assets/bilder/sauna/titel.jpg
titelbild_alt: "[Was ist auf dem Bild zu sehen?]"
updates:
  - datum: 2026-11-20
    text: "[Kurzes Update]"
galerie:
  - bild: ../../assets/bilder/sauna/1.jpg
    alt: "[Beschreibung]"
---
[Deine Story: Worum geht's, warum, wie, was hast du gelernt?]
```

## Bereiche: Felder

| Feld | Pflicht | Bedeutung |
|---|---|---|
| `titel` | ja | z. B. „Menschen & Community“ |
| `navtitel` | – | kurzer Name in der Navigation, z. B. „Menschen“ |
| `reihenfolge` | ja | 1 bis 4 |
| `untertitel` | – | steht unter dem Namen auf der Startseiten-Kachel und als Untertitel auf der Bereichsseite, z. B. „Leidenschaftsprojekte“ |
| `bild`, `bild_alt` | – | Foto oben auf der Bereichsseite |
| *(Text)* | – | Intro, 2 bis 4 Sätze |

Die Slugs sind fest: `gourmet`, `bauen`, `sport`, `menschen`. Sie sind gleichzeitig die URLs.

## Momente: Felder

| Feld | Pflicht | Bedeutung |
|---|---|---|
| `titel` | ja | |
| `datum` | ja | wann es passiert ist |
| `ort` | – | grob, z. B. „Stockholm“, nie eine Adresse |
| `bild`, `bild_alt` | – | |
| `entwurf` | – | |
| *(Text)* | – | die Geschichte |

## Einstellungen (`site.yml`)

Diese Datei enthält:
- `name`, `beschreibung` (für Google und die Link-Vorschau, höchstens 155 Zeichen), `intro`, `portrait`, `portrait_alt`
- `motto`, `motto_text` (der Text unter „Rise and Shine“)
- `links`: `instagram`, `strava`, `substack`, `linkedin`
- `plattenteller`: `datei`, `titel`, `interpret`, `lizenz`, `fliegende_platte` (Easter Egg an oder aus, Standard: an)
- `klick.knopf`: Text des Klick-Knopfs. `klick.zaehler`: Wort hinter der Zahl, angezeigt als „12× geklickt“

Leere Links werden nicht angezeigt.

## Zitate (`zitate.yml`)

Die Datei ist eine Liste von Einträgen mit `text` (Pflicht), `von` und `quelle`. Die Reihenfolge in der Datei ist die Reihenfolge auf der Seite. Zitate kurz halten (etwa bis 60 Zeichen): Das längste bestimmt die Höhe des Zitatfelds unter dem Klick-Knopf.

## Videos (`videos.yml`)

Liste mit `titel` (Pflicht), `link` (YouTube-Link, Pflicht), `von` (Kanal), `warum` (optional, ein Satz) und `geschichte` (`true` bei genau einem Video: Es steht groß neben deiner Geschichte). Abgespielt wird erst nach einem Klick; vorher lädt nichts von YouTube, auch kein Vorschaubild.

## Bücher (`buecher.yml`)

Liste mit `titel` (Pflicht), `autor`, `mitgenommen` (1–2 Sätze), `foto` und `foto_alt` (am besten ein eigenes Foto deines Exemplars; fremde Cover sind urheberrechtlich heikel) und `link`.

## Meine Orte (`orte.yml`)

Liste mit `name` (Pflicht), `kategorie` (`essen` · `hidden-spot` · `treffpunkt` · `sonstiges`), `koordinaten` (Pflicht, `"48.13743, 11.57549"`), `notiz` und `link`. Für Orte, zu denen es keinen Beitrag gibt. Orte mit Beitrag trägst du im Beitrag unter `orte` ein.

## Soll-Schema für `src/content.config.ts`

Stand 21.11.2026: Maßgeblich ist der Code in `src/content.config.ts`. Gegenüber dem Schema unten sind dazugekommen: bei Beiträgen `mitnehmen` und `orte`, außerdem die Sammlungen `videos`, `buecher` und `orte` (siehe oben).

Das Schema wurde am 17.10.2026 mit **Astro 7.4** und den Startinhalten getestet, am 23.10.2026 noch einmal mit `fliegende_platte`. Der Build war grün, auch mit leeren Feldern und mit Bildern in `updates` und `galerie`. Dazu braucht es die Pakete `astro` und `js-yaml`.

**Wichtig:** Pages CMS kann leere Felder als `""` oder `null` speichern. Das muss als „nicht gesetzt“ gelten, sonst bricht der Build.

```ts
import { defineCollection } from 'astro:content';
import { glob, file } from 'astro/loaders';
import { z } from 'astro/zod';
import { load } from 'js-yaml';

// "" und null aus Pages CMS → undefined
const leer = (v: unknown) => (v === '' || v === null ? undefined : v);
const optText = z.preprocess(leer, z.string().optional());

const BEREICHE = ['gourmet', 'bauen', 'sport', 'menschen'] as const;

const beitraege = defineCollection({
  loader: glob({ base: './src/content/beitraege', pattern: '**/*.md' }),
  schema: ({ image }) => {
    const optBild = z.preprocess(leer, image().optional());
    return z.object({
      titel: z.string(),
      datum: z.coerce.date(),
      bereich: z.enum(BEREICHE),
      tags: z.preprocess(leer, z.array(z.string()).default([])),
      status: z.preprocess(leer, z.enum(['geplant', 'laeuft', 'fertig', 'pausiert']).optional()),
      zeitraum: optText,
      aktiv: z.preprocess(leer, z.boolean().default(false)),
      titelbild: optBild,
      titelbild_alt: optText,
      bildunterschrift: optText,
      updates: z.preprocess(leer, z.array(z.object({
        datum: z.coerce.date(),
        text: z.string(),
        bild: optBild,
        bild_alt: optText,
      })).default([])),
      galerie: z.preprocess(leer, z.array(z.object({
        bild: image(),
        alt: optText,
      })).default([])),
      entwurf: z.preprocess(leer, z.boolean().default(false)),
    });
  },
});

const bereiche = defineCollection({
  loader: glob({ base: './src/content/bereiche', pattern: '*.md' }),
  schema: ({ image }) => z.object({
    titel: z.string(),
    navtitel: optText,
    reihenfolge: z.number(),
    untertitel: optText,
    bild: z.preprocess(leer, image().optional()),
    bild_alt: optText,
  }),
});

const momente = defineCollection({
  loader: glob({ base: './src/content/momente', pattern: '*.md' }),
  schema: ({ image }) => z.object({
    titel: z.string(),
    datum: z.coerce.date(),
    ort: optText,
    bild: z.preprocess(leer, image().optional()),
    bild_alt: optText,
    entwurf: z.preprocess(leer, z.boolean().default(false)),
  }),
});

const seiten = defineCollection({
  loader: glob({ base: './src/content/seiten', pattern: '*.md' }),
  schema: z.object({ titel: z.string() }),
});

// site.yml ist ein einzelnes Objekt → als Eintrag mit der ID "site" laden
const site = defineCollection({
  loader: file('src/content/einstellungen/site.yml', {
    parser: (text) => ({ site: load(text) as object }),
  }),
  schema: ({ image }) => z.object({
    name: z.string(),
    beschreibung: optText,
    intro: z.string(),
    portrait: z.preprocess(leer, image().optional()),
    portrait_alt: optText,
    motto: optText,
    motto_text: optText,
    links: z.object({ instagram: optText, strava: optText, substack: optText, linkedin: optText }),
    plattenteller: z.object({
      datei: optText,
      titel: optText,
      interpret: optText,
      lizenz: optText,
      fliegende_platte: z.preprocess(leer, z.boolean().default(true)),
    }),
    klick: z.object({ knopf: optText, zaehler: optText }),
  }),
});

// zitate.yml ist eine Liste ohne IDs → IDs nach Reihenfolge vergeben (001, 002, …)
const zitate = defineCollection({
  loader: file('src/content/einstellungen/zitate.yml', {
    parser: (text) =>
      (load(text) as object[]).map((eintrag, i) => ({ id: String(i + 1).padStart(3, '0'), ...eintrag })),
  }),
  schema: z.object({ text: z.string(), von: optText, quelle: optText }),
});

export const collections = { beitraege, bereiche, momente, seiten, site, zitate };
```

Abrufen geht z. B. so:
- `await getEntry('site', 'site')`
- `await getCollection('beitraege', ({ data }) => !data.entwurf)`
- `(await getCollection('zitate')).sort((a, b) => a.id.localeCompare(b.id))`

Teste in Phase 7 trotzdem mit einem echten Beitrag aus Pages CMS, der kein Titelbild hat.

## Neue Beiträge: drei Wege

### Weg 1: Pages CMS (empfohlen, ohne Claude)

Das ist ein Formular im Browser, das auch am Handy funktioniert. Speichern bedeutet: Commit auf GitHub, die Action baut, und nach etwa 1 bis 2 Minuten ist der Beitrag live.

**Einmalig einrichten**
1. https://app.pagescms.org öffnen und mit GitHub anmelden.
2. Der Pages-CMS-App Zugriff auf das Website-Repo geben.
3. Repo und Branch `main` wählen. Die Datei `.pages.yml` im Repo baut die Formulare automatisch.

**Beitrag anlegen**
1. „Beiträge & Projekte“ öffnen und „Neu“ wählen.
2. Felder ausfüllen und Bilder hochladen.
3. Speichern.

**Update zu einem Projekt:** Projekt öffnen, bei „Updates“ einen Eintrag hinzufügen, speichern.

**Entwurf:** „Entwurf“ anhaken. Der Beitrag liegt dann im Repo, ist aber nicht auf der Seite.

**Vorsicht:** Bilder landen 1:1 im öffentlichen Repo. Lade nur Fotos ohne Standortdaten hoch (siehe Bildregeln).

### Weg 2: Claude Code mit `/beitrag`

1. `vorlagen/neuer-beitrag.md` kopieren, ausfüllen und die Bilder daneben in einen Ordner legen, z. B. `eingang/sauna/`.
2. In Claude Code eingeben: `/beitrag eingang/sauna`.
3. Claude Code übernimmt deinen Text wörtlich, räumt die Bilder auf, legt die Markdown-Datei an, baut die Seite und zeigt dir eine Vorschau.
4. Committet wird erst, wenn du es sagst.

Dieser Weg eignet sich für größere Beiträge oder wenn du Hilfe bei Struktur und Tags willst.

### Weg 3: direkt auf GitHub

Für Kleinigkeiten wie einen Tippfehler: Datei auf github.com öffnen, auf den Stift klicken, ändern, „Commit changes“.

## Bildregeln

1. **Standort aus:** In der Kamera-App das Speichern des Standorts ausschalten. Sonst steht in jedem Foto die GPS-Position, auch bei Fotos von zu Hause.
2. **Andere Menschen:**
   - Ihre Gesichter verpixelst du vor dem Hochladen in der Bilddatei, z. B. mit dem Bildeditor am Handy. CSS-Effekte reichen nicht, weil das Original öffentlich im Repo läge.
   - Besser ist es, vorher zu fragen.
   - Kennzeichen unkenntlich machen.
3. **Größe:** Am Handy gehen Originale. Über `/beitrag` werden sie automatisch verkleinert (2400 px). Astro erzeugt beim Bauen ohnehin kleine AVIF- und WebP-Versionen.
4. **Was im Repo war, bleibt in der Git-Historie.** Rutscht doch ein falsches Bild durch, sagst du Claude Code Bescheid. Es kann die Historie bereinigen, das ist aber aufwendig.

## Platzhalter

Alles in `[eckigen Klammern]` ist ein Platzhalter für Johannes' eigenen Text. Vor dem Launch nach `[` suchen. Das kann auch Claude Code: „Liste alle Platzhalter auf.“
