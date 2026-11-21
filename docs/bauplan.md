# Bauplan für Claude Code

Acht Phasen. Pro Phase gibt es einen Prompt zum Kopieren und eine kurze Prüfliste für dich.

**Tipps**
- Starte für jede Phase ein frisches Gespräch, mit `/clear` oder einer neuen Sitzung. Claude Code liest `CLAUDE.md` jedes Mal automatisch.
- Bei größeren Phasen erst den Plan zeigen lassen und dann bauen. Das steht schon in den Prompts.
- Wenn etwas nicht passt: einen Screenshot machen, ihn in Claude Code einfügen und sagen, was stört. Das ist oft schneller als eine lange Beschreibung.
- Nach jeder Phase committen, wenn alles passt: „Committe das mit einer kurzen deutschen Nachricht.“

---

## Phase 0: Vorbereitung (du, ca. 15 Min.)

1. Ein **öffentliches** GitHub-Repo anlegen, z. B. `website`. Für den Namen ist egal, wie es heißt, weil eine eigene Domain dazukommt.
2. Das Repo auf deinen Rechner klonen. Das geht auch über GitHub Desktop.
3. Den kompletten Inhalt dieses Kits in den Repo-Ordner kopieren, inklusive der versteckten Dateien `.pages.yml`, `.gitignore` und `.claude/`.
4. Claude Code im Ordner starten, im Terminal mit `claude` oder in der Desktop-App. Installation: https://code.claude.com/docs/en/quickstart
5. Node.js in einer aktuellen LTS-Version muss installiert sein. Claude Code prüft das in Phase 1.

---

## Phase 1: Gerüst

```
Lies CLAUDE.md, docs/briefing.md, docs/inhalte.md und docs/design.md.
Richte in diesem Ordner ein Astro-Projekt ein (aktuelle stabile Version, TypeScript),
ohne vorhandene Dateien zu überschreiben:
- Content Collections laut docs/inhalte.md, inklusive Umgang mit leeren Feldern aus Pages CMS.
  Lade auch site.yml und zitate.yml.
- src/styles/global.css mit den Design-Tokens aus docs/design.md (hell/dunkel automatisch),
  Schriften über Fontsource (Familjen Grotesk + Literata, nur Latin).
- Basis-Layout: <head> mit Titel, Beschreibung, Canonical, Open Graph (public/og.jpg),
  Favicons aus public/, Skip-Link und <ClientRouter /> aus astro:transitions (damit später
  die Musik beim Seitenwechsel weiterläuft). Kopfzeile und Footer als Komponenten, wie in
  docs/referenz/startseite.html. Das Handymenü kommt mit, sein Skript hängt sich an
  astro:page-load.
- scripts/bilder.mjs liegt schon bei (getestet). Trag es als npm-Skript "bilder" ein und
  nimm sharp als Dependency auf. Das Schema in docs/inhalte.md braucht außerdem js-yaml.
- @astrojs/sitemap und robots.txt.
Zeig mir zuerst deinen Plan. Setz ihn dann um und sorg dafür, dass npm run build fehlerfrei durchläuft.
```

**Prüfen:** `npm run dev` startet. Kopf und Footer sehen aus wie in der Referenz, hell und dunkel. Der Build ist grün.

---

## Phase 2: Startseite

```
Baue die Startseite nach docs/referenz/startseite.html und den Screenshots in docs/referenz/.
Alle Inhalte kommen aus den Collections, nichts hart codieren:
- Intro aus site.yml. Der Schlusspunkt wird zum orangen Punkt mit der Aufgeh-Animation.
- Porträt aus site.yml über <Picture>, sofort laden.
- „Gerade dran“: Beiträge mit aktiv: true, ohne Entwürfe, nach letzter Aktivität sortiert,
  max. 6, als Projektliste (Zeilen, nicht als Raster). Abschnitt ausblenden, wenn leer.
- „Bereiche“: die vier Bereiche nach reihenfolge als Kacheln (Foto, Name, untertitel).
- Rise-and-Shine-Band (invertiert) mit motto_text und Klick-Knopf: Text aus
  site.yml → klick.knopf, daneben „Y× geklickt“. Y zählt die Klicks dieses Besuchers in
  localStorage (mit try/catch). Darunter zeigt jeder Klick das nächste Zitat aus zitate.yml
  (Text und „von“, der Reihe nach, vor dem ersten Klick keins), siehe docs/design.md.
  Das Skript hängt sich an astro:page-load.
- Footer mit Plattenteller als <button data-platte> und <p data-platte-text> laut
  docs/design.md. Die Musik selbst kommt in Phase 2b.
- JSON-LD Person (name, url, image, sameAs = nicht-leere Links).
Prüfe 390 px und 1440 px, jeweils hell und dunkel, mit Screenshots, und vergleiche sie
mit der Referenz. Nenne mir Abweichungen, bevor du sie „verbesserst“.
```

**Prüfen:** am Handy in hell und dunkel. Der Knopf zählt, jeder Klick zeigt ein anderes Zitat, alle Links funktionieren.

---

## Phase 2b: Musik und fliegende Platte

```
Lies in docs/design.md den Abschnitt „Plattenteller und fliegende Platte“ und schau dir
src/lib/musik.js an. Das Skript ist fertig und getestet. Ändere es nicht, sondern baue
das HTML und CSS dafür:
- Im Basis-Layout direkt nach dem Skip-Link: <div transition:persist="musik"> mit dem
  Audio-Element (Song aus site.yml → plattenteller: datei, titel, interpret; loop,
  preload="none") und der fliegenden Platte, aber nur wenn plattenteller.fliegende_platte
  true ist. Ohne Song lässt du beides weg.
- Etikett der fliegenden Platte: dasselbe Foto wie im Footer, über <Image> klein gerechnet.
- CSS für .flieger laut docs/design.md, z-index unter dem Handymenü.
- Einbinden mit <script>import '../lib/musik.js';</script> im Basis-Layout.
Teste danach mit npm run build und npm run preview im Browser: Die Musik startet beim
ersten Klick, Antippen der fliegenden Platte hält alles an, die Footer-Platte spielt an
derselben Stelle weiter, ein Seitenwechsel unterbricht die Musik nicht, und mit
prefers-reduced-motion parkt die Platte unten rechts. Prüfe auch Handymenü und
Klick-Zähler nach einem Seitenwechsel.
```

**Prüfen:** am Handy. Der erste Tipp startet die Musik, Antippen der Platte hält sie an, beim Wechsel auf eine Bereichsseite spielt sie weiter.

---

## Phase 3: Bereiche und Beiträge

```
Baue die Bereichsseiten (/gourmet/, /bauen/, /sport/, /menschen/) und die Beitragsseite
(/<bereich>/<slug>/) nach docs/design.md, docs/referenz/bereich.html und docs/referenz/beitrag.html:
- Bereichsseite: Titel, Untertitel, Intro (Markdown), optionales Foto, dann alle Beiträge
  als Kartenraster (Bild, Status + Datum, Name, Tags) nach letzter Aktivität.
  Leerer Zustand: „Noch keine Beiträge.“
- Beitragsseite: Zurück-Link, Titel, Tags, Fakten (dl), Titelbild + Bildunterschrift,
  Story, Updates (neueste zuerst, neueste mit orangem Punkt), Galerie mit <dialog>-Lightbox,
  „Mehr aus <Bereich>“ (bis zu 3), Footer. Leere Teile komplett weglassen.
- Entwürfe nirgends anzeigen und nicht in die Sitemap.
- Titel/Beschreibung/OG pro Beitrag (OG-Bild = Titelbild, sonst og.jpg).
Teste mit den Start-Beiträgen und lege dir zum Testen einen Entwurf mit Updates und
Galerie an (Platzhalterbilder nur lokal, nicht committen).
```

**Prüfen:** Ein Projekt öffnen und den Platzhalter-Text sehen. Die Galerie lässt sich per Tastatur öffnen und schließen.

---

## Phase 4: Rise & Shine und Momente

```
Baue /rise-and-shine/ (oben das Band wie auf der Startseite mit Klick-Knopf, darunter der
Text aus seiten/rise-and-shine.md, dann die Zitate aus zitate.yml)
sowie /momente/ und /momente/<slug>/ laut docs/design.md. Auf /menschen/ kommt nach
den Beiträgen der Abschnitt „Momente“ (nur wenn es veröffentlichte Momente gibt).
```

---

## Phase 5: Rechtliches, 404 und Feinschliff

```
Baue /impressum/ und /datenschutz/ aus src/content/seiten/ (schlichtes Leselayout) und
eine 404-Seite. Verlinke beide im Footer. Prüfe danach die ganze Seite:
Tastaturbedienung, Fokus, Alt-Texte, Kontraste, prefers-reduced-motion, keine
Konsolenfehler, keine externen Requests (Netzwerk-Tab), Lighthouse mobil.
Liste alle verbliebenen Platzhalter in [eckigen Klammern] auf.
```

---

## Phase 6: Live gehen

```
Richte das Deployment auf GitHub Pages ein: .github/workflows/deploy.yml nach der
aktuellen Astro-Doku (withastro/action + actions/deploy-pages), Trigger auf push nach main
und manuell. site = https://johannesbrix.com, kein base. Erkläre mir danach Schritt für
Schritt, was ich in den GitHub-Einstellungen und bei meinem Domain-Anbieter tun muss
(siehe docs/launch-checkliste.md).
```

Danach arbeitest du `docs/launch-checkliste.md` ab. Plane die DNS-Umstellung früh ein, denn bis HTTPS aktiv ist, können bis zu 24 Stunden vergehen.

---

## Phase 7: Redaktion testen

```
Prüfe .pages.yml gegen die aktuelle Pages-CMS-Doku und das Schema. Ich lege gleich in
Pages CMS einen Test-Beitrag ohne Titelbild und einen mit Bild an. Danach: Prüfe, welche
Werte Pages CMS geschrieben hat (leere Felder, Bildpfade, Datumsformat), und passe Schema
oder .pages.yml an, bis der Build grün ist. Teste anschließend den Skill /beitrag mit
vorlagen/beispiel-ausgefuellt.md.
```

Danach löschst du die Test-Beiträge wieder.

---

## Phase 8 (nach der Reise): v1.1

- Erste Momente einpflegen
- Optional GoatCounter. Prompt: „Binde GoatCounter cookielos ein (Code: johannesbrix) und ergänze die Datenschutzerklärung.“
- Optional die Action „Bilder aufräumen“: Bei jedem Push `npm run bilder` auf `src/assets/bilder` ausführen und Änderungen zurück-committen.
- Feinschliff mit echten Fotos
