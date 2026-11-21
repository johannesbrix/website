import { defineCollection } from 'astro:content';
import { glob, file } from 'astro/loaders';
import { z } from 'astro/zod';
import { load } from 'js-yaml';
import { KATEGORIE_IDS } from './lib/brixmap';

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

// YouTube-Link (watch, youtu.be, shorts, embed) → Video-ID
const youtube = z.string().transform((wert, ctx) => {
  const treffer = wert.trim().match(/(?:youtube(?:-nocookie)?\.com\/(?:watch\?(?:.*&)?v=|shorts\/|embed\/|live\/)|youtu\.be\/)([\w-]{11})/);
  if (!treffer) {
    ctx.addIssue({ code: 'custom', message: `„${wert}“ ist kein YouTube-Link.` });
    return z.NEVER;
  }
  return treffer[1];
});

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

// Listen-Dateien ohne IDs (wie zitate.yml): IDs nach Reihenfolge vergeben
const liste = (pfad: string) =>
  file(pfad, {
    parser: (text) =>
      ((load(text) as object[] | null) ?? []).map((eintrag, i) => ({ id: String(i + 1).padStart(3, '0'), ...eintrag })),
  });

// Videos für Rise & Shine. Abgespielt werden sie erst nach einem Klick (Zwei-Klick-Lösung, siehe Video.astro).
const videos = defineCollection({
  loader: liste('src/content/einstellungen/videos.yml'),
  schema: z.object({
    titel: z.string(),
    link: youtube,
    von: optText,
    warum: optText,
    geschichte: z.preprocess(leer, z.boolean().default(false)),
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

// Johannes' eigene Orte für die Brixmap (zusätzlich zu den Orten aus Beiträgen)
const orte = defineCollection({
  loader: liste('src/content/einstellungen/orte.yml'),
  schema: z.object({
    name: z.string(),
    kategorie: z.preprocess(leer, z.enum(KATEGORIE_IDS).default('sonstiges')),
    koordinaten,
    notiz: optText,
    link: optText,
  }),
});

export const collections = { beitraege, bereiche, momente, seiten, site, zitate, videos, buecher, orte };
