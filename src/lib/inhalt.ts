import { getCollection, getEntry, type CollectionEntry } from 'astro:content';
import { getImage } from 'astro:assets';
import type { ImageMetadata } from 'astro';
import type { Ort } from './brixmap';
import type { IconName } from './icons';

export type Beitrag = CollectionEntry<'beitraege'>;
export type Bereich = CollectionEntry<'bereiche'>;
export type Status = NonNullable<Beitrag['data']['status']>;

export const STATUS: Record<Status, string> = {
  geplant: 'Geplant',
  laeuft: 'Läuft',
  fertig: 'Fertig',
  pausiert: 'Pausiert',
};

/** Letzte Aktivität: das neueste Datum aus `datum` und allen `updates[].datum`. */
export function letzteAktivitaet(beitrag: Beitrag): Date {
  return beitrag.data.updates.reduce(
    (neuestes, update) => (update.datum > neuestes ? update.datum : neuestes),
    beitrag.data.datum,
  );
}

/** Alle veröffentlichten Beiträge (ohne Entwürfe), die neueste Aktivität zuerst. */
export async function beitraege(): Promise<Beitrag[]> {
  const alle = await getCollection('beitraege', ({ data }) => !data.entwurf);
  return alle.sort((a, b) => letzteAktivitaet(b).getTime() - letzteAktivitaet(a).getTime());
}

/** Die vier Bereiche in ihrer Reihenfolge. */
export async function bereiche(): Promise<Bereich[]> {
  return (await getCollection('bereiche')).sort((a, b) => a.data.reihenfolge - b.data.reihenfolge);
}

/** Alle Einstellungen in einem Objekt: site.yml (Allgemein), startseite.yml und band.yml. */
export async function einstellungen() {
  const [site, startseite, band] = await Promise.all([
    getEntry('site', 'site'),
    getEntry('startseite', 'startseite'),
    getEntry('band', 'band'),
  ]);
  if (!site || !startseite || !band) throw new Error('In src/content/einstellungen/ fehlt site.yml, startseite.yml oder band.yml.');
  return { ...site.data, ...startseite.data, ...band.data };
}
export type Einstellungen = Awaited<ReturnType<typeof einstellungen>>;

/** Zitate in der Reihenfolge aus zitate.yml. */
export async function zitate() {
  return (await getCollection('zitate')).sort((a, b) => a.id.localeCompare(b.id)).map((z) => z.data);
}

/** Videos in der Reihenfolge aus videos.yml. */
export async function videos() {
  return (await getCollection('videos')).sort((a, b) => a.id.localeCompare(b.id)).map((v) => v.data);
}

/** Bücher in der Reihenfolge aus buecher.yml. */
export async function buecher() {
  return (await getCollection('buecher')).sort((a, b) => a.id.localeCompare(b.id)).map((b) => b.data);
}

/** ID eines Orts aus einem Beitrag, z. B. für den Link „Auf der Brixmap“. */
export const beitragsOrtId = (beitragId: string, index: number) => `b-${beitragId}-${index + 1}`;

/** Johannes' Orte aus Beiträgen (orange Pins mit Sonne), mit Link zum Beitrag. Weitere eigene Orte
 *  setzt er direkt auf der Karte von seinem freigeschalteten Gerät (docs/brixmap.md). */
export async function meineOrte(): Promise<Ort[]> {
  return (await beitraege()).flatMap((b) =>
    b.data.orte.map((ort, i): Ort => ({
      id: beitragsOrtId(b.id, i),
      art: 'ich',
      name: ort.name,
      kategorie: b.data.bereich === 'gourmet' ? 'essen' : undefined,
      notiz: ort.notiz,
      lat: ort.koordinaten.lat,
      lng: ort.koordinaten.lng,
      link: `/${b.data.bereich}/${b.id}/`,
      linkText: 'Zum Beitrag',
    })),
  );
}

/** Plattform-Links für Footer und Handymenü, leere fallen weg. Der Name ist der Name des Icon-Links. */
export function plattformen(links: Einstellungen['links']) {
  const alle: { name: string; icon: IconName; href?: string }[] = [
    { name: 'Instagram', icon: 'instagram', href: links.instagram },
    { name: 'Strava', icon: 'strava', href: links.strava },
    { name: 'Blog auf Substack', icon: 'substack', href: links.substack },
    { name: 'Lebenslauf auf LinkedIn', icon: 'linkedin', href: links.linkedin },
  ];
  return alle.filter((link): link is { name: string; icon: IconName; href: string } => Boolean(link.href));
}

/** Icon je Bereich, z. B. für Flächen ohne Foto und die Filter */
export const BEREICH_ICONS: Record<string, IconName> = {
  gourmet: 'gourmet',
  bauen: 'bauen',
  sport: 'sport',
  menschen: 'menschen',
};

// Daten aus dem Frontmatter sind UTC-Mitternacht, deshalb immer in UTC formatieren.
const KURZ = new Intl.DateTimeFormat('de-DE', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });

/** z. B. „17. Okt. 2026“ */
export const datum = (d: Date) => KURZ.format(d);
/** z. B. „2026-10-17“ für <time datetime> */
export const isoDatum = (d: Date) => d.toISOString().slice(0, 10);

/** Markdown grob in Klartext umwandeln, z. B. für Beschreibungen. */
export function klartext(markdown = ''): string {
  return markdown
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/<[^>]+>/g, ' ')
    .replace(/^\s{0,3}(?:#{1,6}|>|[-*+]|\d+\.)\s+/gm, '')
    .replace(/(\*\*|__|\*|`)/g, '')
    .replace(/\\$/gm, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Kürzt an einer Wortgrenze und hängt „…“ an. */
export function kurz(text: string, max = 155): string {
  if (text.length <= max) return text;
  const schnitt = text.slice(0, max - 1);
  const grenze = schnitt.lastIndexOf(' ');
  return `${(grenze > max * 0.6 ? schnitt.slice(0, grenze) : schnitt).replace(/[\s,;:–-]+$/, '')}…`;
}

/** Bild für Open Graph und JSON-LD: JPEG, höchstens 1200 px breit. */
export async function teilbild(bild: ImageMetadata | undefined) {
  if (!bild) return undefined;
  const ergebnis = await getImage({ src: bild, width: Math.min(1200, bild.width), format: 'jpg' });
  return {
    src: ergebnis.src,
    width: Number(ergebnis.attributes.width),
    height: Number(ergebnis.attributes.height),
  };
}
