// Gemeinsame Angaben für die Brixmap: Inhaltsschema, Seite und Kartenskript.
// Der Server (api/src/index.js) kennt dieselben Kategorien.
import type { IconName } from './icons';

export const KATEGORIE_IDS = ['essen', 'hidden-spot', 'treffpunkt', 'sonstiges'] as const;
export type Kategorie = (typeof KATEGORIE_IDS)[number];

export const KATEGORIEN: Record<Kategorie, string> = {
  essen: 'Essen & Trinken',
  'hidden-spot': 'Hidden Spot',
  treffpunkt: 'Treffpunkt',
  sonstiges: 'Sonstiges',
};

// Die zwei Arten von Pins: Orange mit Sonne sind Johannes' Orte, Anthrazit mit Rakete die
// Empfehlungen von Besuchern. „Besucht“ gibt es nicht mehr (Johannes, 22.11.2026: zu viel Pflege).
// Aussehen: .pin in global.css.
export const ARTEN = {
  ich: { icon: 'sonne', name: 'Von mir' },
  empfehlung: { icon: 'rakete', name: 'Empfohlen' },
} as const satisfies Record<string, { icon: IconName; name: string }>;
export type Art = keyof typeof ARTEN;

export interface Ort {
  id: string;
  art: Art;
  name: string;
  kategorie?: Kategorie;
  notiz?: string;
  lat: number;
  lng: number;
  /** Link zum Beitrag */
  link?: string;
  linkText?: string;
  /** Name der Person, die den Ort empfohlen hat */
  von?: string;
}
