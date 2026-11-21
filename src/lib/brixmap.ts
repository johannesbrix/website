// Gemeinsame Angaben für die Brixmap: Inhaltsschema, Seite und Kartenskript.
// Der Server (api/src/index.js) kennt dieselben Kategorien.

export const KATEGORIE_IDS = ['essen', 'hidden-spot', 'treffpunkt', 'sonstiges'] as const;
export type Kategorie = (typeof KATEGORIE_IDS)[number];

export const KATEGORIEN: Record<Kategorie, string> = {
  essen: 'Essen & Trinken',
  'hidden-spot': 'Hidden Spot',
  treffpunkt: 'Treffpunkt',
  sonstiges: 'Sonstiges',
};

// Die drei Arten von Pins. Die Emojis lassen sich hier tauschen.
export const ARTEN = {
  ich: { emoji: '☀️', name: 'Von mir' },
  empfehlung: { emoji: '💌', name: 'Empfehlungen' },
  besucht: { emoji: '✅', name: 'Besucht' },
} as const;
export type Art = keyof typeof ARTEN;

export interface Ort {
  id: string;
  art: Art;
  name: string;
  kategorie?: Kategorie;
  notiz?: string;
  lat: number;
  lng: number;
  /** Link zum Beitrag oder zu einer Website */
  link?: string;
  linkText?: string;
  /** Name der Person, die den Ort empfohlen hat */
  von?: string;
  /** Johannes' Kommentar nach dem Besuch */
  kommentar?: string;
  besuchtAm?: string;
}
