#!/usr/bin/env node
// Bilder aufräumen: Metadaten (inkl. GPS) entfernen, nach EXIF drehen, max. 2400 px, sRGB.
// Aufruf: npm run bilder -- [Dateien oder Ordner …]   (ohne Angabe: src/assets/bilder)
// Bereits saubere Bilder werden übersprungen, damit sie nicht bei jedem Lauf neu komprimiert werden.
import { readdir, stat, writeFile } from 'node:fs/promises';
import { extname, join, relative } from 'node:path';
import sharp from 'sharp';

// Ohne das hält sharp unter Windows die Originaldatei offen, und das Überschreiben scheitert (UNKNOWN, open).
sharp.cache(false);

const MAX = 2400;
const ENDUNGEN = new Set(['.jpg', '.jpeg', '.png', '.webp']);
const ziele = process.argv.slice(2).length ? process.argv.slice(2) : ['src/assets/bilder'];

async function* dateien(pfad) {
  const info = await stat(pfad);
  if (info.isDirectory()) {
    for (const eintrag of await readdir(pfad)) yield* dateien(join(pfad, eintrag));
  } else if (ENDUNGEN.has(extname(pfad).toLowerCase())) {
    yield pfad;
  }
}

function kb(bytes) {
  return `${Math.round(bytes / 1024)} KB`;
}

let bearbeitet = 0;
let uebersprungen = 0;

for (const ziel of ziele) {
  for await (const datei of dateien(ziel)) {
    const meta = await sharp(datei).metadata();
    const hatMetadaten = Boolean(meta.exif || meta.xmp || meta.iptc || (meta.orientation && meta.orientation !== 1));
    const zuGross = Math.max(meta.width ?? 0, meta.height ?? 0) > MAX;
    const fremdesProfil = Boolean(meta.icc) && meta.space !== 'srgb';
    if (!hatMetadaten && !zuGross && !fremdesProfil && !meta.icc) {
      uebersprungen++;
      continue;
    }

    const vorher = (await stat(datei)).size;
    let bild = sharp(datei)
      .rotate() // nach EXIF-Ausrichtung drehen, bevor die Metadaten wegfallen
      .resize({ width: MAX, height: MAX, fit: 'inside', withoutEnlargement: true })
      .toColourspace('srgb');

    const endung = extname(datei).toLowerCase();
    if (endung === '.png') bild = bild.png({ compressionLevel: 9 });
    else if (endung === '.webp') bild = bild.webp({ quality: 85 });
    else bild = bild.jpeg({ quality: 85, mozjpeg: true });

    // sharp entfernt Metadaten standardmäßig (kein keepMetadata/withMetadata).
    const puffer = await bild.toBuffer();
    await writeFile(datei, puffer);
    bearbeitet++;
    const grund = [hatMetadaten && 'Metadaten', zuGross && `> ${MAX} px`, meta.icc && 'Farbprofil'].filter(Boolean).join(', ');
    console.log(`✓ ${relative(process.cwd(), datei)}  (${grund})  ${kb(vorher)} → ${kb(puffer.length)}`);
  }
}

console.log(`\nFertig: ${bearbeitet} bearbeitet, ${uebersprungen} waren schon sauber.`);
