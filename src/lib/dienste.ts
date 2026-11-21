// Adresse des kleinen Servers für Klick-Zähler und Brixmap-Empfehlungen
// (Cloudflare Worker im Ordner api/, Einrichtung in docs/brixmap.md).
// Leer heißt: Die Seite läuft ohne Server. Der Klick-Zähler zählt dann nur die eigenen Klicks,
// und auf der Brixmap gibt es kein Formular zum Empfehlen.
// Zum lokalen Testen PUBLIC_API_URL=http://localhost:8787 setzen.
const LIVE = '';

export const API: string = (import.meta.env.PUBLIC_API_URL ?? LIVE).replace(/\/+$/, '');
