// Alle Icons der Seite an einer Stelle. Sie werden als SVG direkt ins HTML geschrieben, ohne fremde Server.
// Linien-Icons: Lucide (ISC-Lizenz, lucide.dev). Marken: Simple Icons (CC0, simpleicons.org);
// LinkedIn fehlt dort auf Wunsch der Marke, das Glyph steht deshalb unten als eigener Pfad.
import {
  ArrowRight,
  BookOpen,
  ChefHat,
  ChevronLeft,
  ChevronRight,
  Coffee,
  Disc3,
  Dumbbell,
  ExternalLink,
  Gem,
  Hammer,
  LayoutGrid,
  List,
  LocateFixed,
  Map as Karte,
  MapPin,
  Mic,
  Pause,
  Play,
  Plus,
  Quote,
  Rocket,
  Route,
  Search,
  Sun,
  Trash2,
  Sunrise,
  Users,
  Utensils,
  X,
} from 'lucide-static';
import { siInstagram, siStrava, siSubstack } from 'simple-icons';

// Lucide-SVG ohne Lizenzkommentar und feste Größe, mit etwas feinerer Linie
const linie = (svg: string) =>
  svg
    .replace(/<!--[\s\S]*?-->/, '')
    .replace(/\s(?:width|height)="24"/g, '')
    .replace(/\sclass="[^"]*"/, ' aria-hidden="true" focusable="false"')
    .replace('stroke-width="2"', 'stroke-width="1.8"')
    .trim();

const marke = (pfad: string) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false"><path d="${pfad}"/></svg>`;

const LINKEDIN =
  'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 1 1 0-4.125 2.062 2.062 0 0 1 0 4.125zM7.119 20.452H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z';

export const ICONS = {
  // Bedienung
  schliessen: linie(X),
  abspielen: linie(Play),
  pause: linie(Pause),
  platte: linie(Disc3),
  liste: linie(List),
  karte: linie(Karte),
  plus: linie(Plus),
  suche: linie(Search),
  standort: linie(LocateFixed),
  extern: linie(ExternalLink),
  weiter: linie(ArrowRight),
  route: linie(Route),
  // Blättern in Regalen (nur diese Knöpfe, keine Pfeile an Links)
  zurueck: linie(ChevronLeft),
  vor: linie(ChevronRight),
  loeschen: linie(Trash2),
  // Die drei Türen
  projekte: linie(LayoutGrid),
  rise: linie(Sunrise),
  brixmap: linie(Karte),
  // Bereiche
  gourmet: linie(ChefHat),
  bauen: linie(Hammer),
  sport: linie(Dumbbell),
  menschen: linie(Users),
  // Brixmap: Arten und Kategorien
  sonne: linie(Sun),
  rakete: linie(Rocket),
  essen: linie(Utensils),
  'hidden-spot': linie(Gem),
  treffpunkt: linie(Coffee),
  sonstiges: linie(MapPin),
  // Rise & Shine
  zitat: linie(Quote),
  rede: linie(Mic),
  buch: linie(BookOpen),
  // Marken
  instagram: marke(siInstagram.path),
  strava: marke(siStrava.path),
  substack: marke(siSubstack.path),
  linkedin: marke(LINKEDIN),
} as const;

export type IconName = keyof typeof ICONS;
