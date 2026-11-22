import { defineCollection } from 'astro:content';
import { glob, file } from 'astro/loaders';
import { z } from 'astro/zod';
import { load } from 'js-yaml';

// "" und null aus Pages CMS → undefined
const leer = (v: unknown) => (v === '' || v === null ? undefined : v);
const optText = z.preprocess(leer, z.string().optional());

const BEREICHE = ['gourmet', 'bauen', 'sport', 'menschen'] as const;

// "48.13743, 11.57549" (aus Google Maps kopiert) → { lat, lng }
const koordinaten = z.string().transform((wert, ctx) => {
  const treffer = wert.trim().match(/^(-?\d{1,2}(?:\.\d+)?)\s*,\s*(-?\d{1,3}(?:\.\d+)?)$/);
  const lat = treffer ? Number(treffer[1]) : NaN;
  const lng = treffer ? Number(treffer[2]) : NaN;
  if (!treffer || Math.abs(lat) > 90 || Math.abs(lng) > 180) {
    ctx.addIssue({
      code: 'custom',
      message: `Koordinaten „${wert}“ bitte so angeben: „48.13743, 11.57549“ (in Google Maps per Rechtsklick bzw. langem Tippen auf den Ort kopieren).`,
    });
    return z.NEVER;
  }
  return { lat, lng };
});

// Video-ID aus einem YouTube-Link (watch, youtu.be, shorts, embed, live)
const youtubeId = (link: string) =>
  link.trim().match(/(?:youtube(?:-nocookie)?\.com\/(?:watch\?(?:.*&)?v=|shorts\/|embed\/|live\/)|youtu\.be\/)([\w-]{11})/)?.[1];

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
      // „zeitraum“ gibt es nicht mehr (Johannes, 22.11.2026: das Datum zählt); alte Einträge stören nicht
      aktiv: z.preprocess(leer, z.boolean().default(false)),
      titelbild: optBild,
      titelbild_alt: optText,
      bildunterschrift: optText,
      mitnehmen: optText,
      orte: z.preprocess(leer, z.array(z.object({
        name: z.string(),
        koordinaten,
        notiz: optText,
      })).default([])),
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

const seiten = defineCollection({
  loader: glob({ base: './src/content/seiten', pattern: '*.md' }),
  schema: z.object({ titel: z.string() }),
});

// Einstellungen liegen in drei Dateien, so wie sie in Pages CMS stehen (Johannes, 22.11.2026:
// „etwas unübersichtlich“). Jede Datei ist ein einzelnes Objekt → ein Eintrag mit fester ID.
// einstellungen() in src/lib/inhalt.ts fügt sie wieder zu einem Objekt zusammen.
const einzeln = (pfad: string, id: string) => file(pfad, { parser: (text) => ({ [id]: load(text) as object }) });

// Allgemein: Name, Beschreibung für Google, Links, Musik
const site = defineCollection({
  loader: einzeln('src/content/einstellungen/site.yml', 'site'),
  schema: z.object({
    name: z.string(),
    beschreibung: optText,
    links: z.object({ instagram: optText, strava: optText, substack: optText, linkedin: optText }),
    plattenteller: z.object({
      datei: optText,
      titel: optText,
      interpret: optText,
      lizenz: optText,
      fliegende_platte: z.preprocess(leer, z.boolean().default(true)),
    }),
  }),
});

// Startseite: Intro neben dem Porträt
const startseite = defineCollection({
  loader: einzeln('src/content/einstellungen/startseite.yml', 'startseite'),
  schema: ({ image }) => z.object({
    intro: z.string(),
    portrait: z.preprocess(leer, image().optional()),
    portrait_alt: optText,
  }),
});

// Rise-and-Shine-Band (Startseite und Rise & Shine): Überschrift, Text, Klick-Knopf
const band = defineCollection({
  loader: einzeln('src/content/einstellungen/band.yml', 'band'),
  schema: z.object({
    motto: optText,
    motto_text: optText,
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

// Listen-Dateien ohne IDs (wie zitate.yml): IDs nach Reihenfolge vergeben
const liste = (pfad: string) =>
  file(pfad, {
    parser: (text) =>
      ((load(text) as object[] | null) ?? []).map((eintrag, i) => ({ id: String(i + 1).padStart(3, '0'), ...eintrag })),
  });

// Videos für Rise & Shine. Das Video zur Geschichte läuft direkt auf der Seite, aber erst nach einem
// Klick (Zwei-Klick-Lösung, Video.astro); alle anderen sind Links zu YouTube. Der Link bleibt
// vollständig (z. B. mit Startzeit &t=84s), die ID wird daraus gelesen.
const videos = defineCollection({
  loader: liste('src/content/einstellungen/videos.yml'),
  schema: z
    .object({
      titel: z.string(),
      link: z.string(),
      von: optText,
      warum: optText,
      art: z.preprocess(leer, z.enum(['motivation', 'rede']).default('motivation')),
      geschichte: z.preprocess(leer, z.boolean().default(false)),
    })
    .transform((video, ctx) => {
      const id = youtubeId(video.link);
      if (!id) {
        ctx.addIssue({ code: 'custom', message: `„${video.link}“ ist kein YouTube-Link.` });
        return z.NEVER;
      }
      return { ...video, id };
    }),
});

const buecher = defineCollection({
  loader: liste('src/content/einstellungen/buecher.yml'),
  schema: ({ image }) => z.object({
    titel: z.string(),
    autor: optText,
    mitgenommen: optText,
    foto: z.preprocess(leer, image().optional()),
    foto_alt: optText,
    link: optText,
  }),
});

// Momente und „Meine Orte“ (orte.yml) gibt es seit 22.11.2026 nicht mehr: Johannes setzt eigene Orte
// direkt auf der Karte (docs/brixmap.md).
export const collections = { beitraege, bereiche, seiten, site, startseite, band, zitate, videos, buecher };
