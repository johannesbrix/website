// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { satteri } from '@astrojs/markdown-satteri';

// Markdown-Feinschliff:
// - HTML-Kommentare (Notizen für Johannes, z. B. in seiten/datenschutz.md) landen nicht auf der Seite.
// - Absätze, die nur aus einem Platzhalter in [eckigen Klammern] bestehen, werden leise dargestellt.
/** @type {import('satteri').HastPluginDefinition} */
const aufraeumen = {
  name: 'johannesbrix-aufraeumen',
  comment(node, ctx) {
    ctx.removeNode(node);
  },
  raw(node, ctx) {
    if (/^\s*<!--[\s\S]*-->\s*$/.test(node.value)) ctx.removeNode(node);
  },
  element: {
    filter: ['p'],
    visit(node, ctx) {
      if (/^\[[^\]]*\]$/.test(ctx.textContent(node).trim())) {
        ctx.setProperty(node, 'className', ['platzhalter-text']);
      }
    },
  },
};

export default defineConfig({
  site: 'https://johannesbrix.com',
  integrations: [sitemap()],
  // Das CSS ist klein (rund 3,5 KB komprimiert). Direkt im HTML spart es beim ersten Besuch
  // (meist am Handy über Instagram) einen Roundtrip vor dem ersten Bild.
  build: { inlineStylesheets: 'always' },
  // Kurzer Weg zur Admin-Seite des Servers (api/). Muss zur Adresse in src/lib/dienste.ts passen.
  redirects: {
    '/admin': 'https://johannesbrix-api.johannesbrix-api.workers.dev/admin',
  },
  markdown: {
    processor: satteri({
      // Keine automatischen englischen Anführungszeichen: Johannes' Text erscheint so, wie er ihn tippt.
      features: { smartPunctuation: { quotes: false } },
      hastPlugins: [aufraeumen],
    }),
  },
});
