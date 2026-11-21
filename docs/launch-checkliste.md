# Launch-Checkliste

## 1. GitHub Pages

- [ ] Im Repo unter **Settings → Pages → Build and deployment** als Source **GitHub Actions** wählen.
- [ ] Ersten Push abwarten. Unter **Actions** muss der Workflow grün sein. Die Seite ist dann unter `https://<dein-github-name>.github.io/<repo>/` erreichbar. Weil `site` schon auf die Domain zeigt, können dort Pfade kaputt aussehen. Das ist normal und erledigt sich mit Schritt 2.
- [ ] Domain verifizieren (empfohlen, schützt vor Domain-Übernahme): Im **GitHub-Profil** unter **Settings → Pages → Add a domain** `johannesbrix.com` eintragen und den angezeigten TXT-Eintrag beim Domain-Anbieter anlegen.
- [ ] Im Repo unter **Settings → Pages → Custom domain** `johannesbrix.com` eintragen und speichern.

## 2. DNS beim Domain-Anbieter

Für `johannesbrix.com`, z. B. bei Squarespace Domains, falls die Domain dort liegt wie builder.community.

- [ ] Alte Einträge entfernen, die mit dem Apex (`@`) oder `www` kollidieren, z. B. Parking- oder Squarespace-Standardeinträge.
- [ ] **A-Records** für `@`, alle vier:
  - `185.199.108.153`
  - `185.199.109.153`
  - `185.199.110.153`
  - `185.199.111.153`
- [ ] Optional **AAAA-Records** für `@`:
  - `2606:50c0:8000::153`
  - `2606:50c0:8001::153`
  - `2606:50c0:8002::153`
  - `2606:50c0:8003::153`
- [ ] **CNAME** für `www` mit dem Ziel `<dein-github-name>.github.io`, ohne Repo-Namen.
- [ ] Warten, bis GitHub unter Settings → Pages „DNS check successful“ meldet. Dann **Enforce HTTPS** anhaken. Das kann bis zu 24 Stunden dauern.

## 2b. Cloudflare (Klick-Zähler und Brixmap-Empfehlungen)

Ohne diesen Schritt läuft die Seite trotzdem: Der Klick-Zähler zählt dann nur die eigenen Klicks, und auf der Brixmap gibt es kein Formular. Anleitung: `docs/brixmap.md`, Abschnitt „Einrichten“.

- [ ] Kostenloses Konto auf dash.cloudflare.com anlegen, `workers.dev`-Namen wählen (z. B. `johannesbrix`).
- [ ] Claude Code sagen: „Richte den Server in api/ ein.“ Dabei öffnet sich einmal der Browser für die Anmeldung bei Cloudflare.
- [ ] Ein langes Admin-Passwort festlegen und im Passwort-Manager speichern.
- [ ] Admin-Seite öffnen, anmelden, Lesezeichen am Handy setzen.
- [ ] Test: auf der Brixmap einen Ort empfehlen, im Admin freigeben, als besucht markieren, wieder löschen.

## 3. Inhalte

- [ ] Keine Platzhalter mehr. Claude Code fragen: „Liste alle Platzhalter in [eckigen Klammern] auf.“
- [ ] Intro, Porträt, Beschreibung in `site.yml` passen.
- [ ] Links eingetragen: Instagram, LinkedIn, Strava, Substack.
- [ ] Jeder Bereich hat ein Intro. Am besten hat jeder Bereich auch mindestens einen Beitrag, für Gourmet z. B. dein letztes Brot.
- [ ] Jedes Bild hat eine Bildbeschreibung. Auf Fotos sind keine erkennbaren Fremden und keine Kennzeichen.
- [ ] Impressum mit E-Mail-Adresse. Das ist in Deutschland für Websites mit redaktionellen Inhalten meist Pflicht und keine Rechtsberatung. Falls dein Domain-Anbieter E-Mail-Weiterleitung kann, geht z. B. `hallo@johannesbrix.com`.
- [ ] Datenschutzerklärung passt zu dem, was die Seite tut: Hosting GitHub Pages, Cloudflare-Server (Klick-Zähler, Empfehlungen, Ortssuche), Kartenbilder von OpenStreetMap, YouTube per Zwei-Klick, Speicher im Browser, externe Links. Am besten einmal mit einem Generator oder einer Fachperson gegenlesen (keine Rechtsberatung).
- [ ] Rise & Shine: Geschichte, Video, Zitate. Optional Bücher und weitere Videos.
- [ ] Brixmap: Einleitungssatz in `seiten/brixmap.md`, ein paar eigene Orte.
- [ ] Bei jedem fertigen Beitrag „Zum Mitnehmen“ ausgefüllt.
- [ ] Song: „Gypsy Jazz“ von Aurec liegt in `public/musik/`, Lizenzhinweis steht in `site.yml`.

## 4. Tests

- [ ] Am eigenen Handy: Startseite, eine Bereichsseite, ein Beitrag, Menü, Plattenteller, Klick-Knopf. Einmal hell und einmal dunkel (Systemeinstellung umstellen).
- [ ] Musik auf iPhone (Safari) und Android (Chrome), am besten auch auf einem fremden Handy:
  - Der erste Tipp irgendwo startet die Musik, die Platte beginnt sich zu drehen.
  - Antippen der fliegenden Platte hält alles an. Die Platte bleibt stehen, auch nach einem Seitenwechsel.
  - Erneutes Antippen spielt an derselben Stelle weiter.
  - Beim Wechsel auf eine Bereichsseite und zurück läuft die Musik ohne Unterbrechung.
  - Die Platte verdeckt nichts Wichtiges dauerhaft, z. B. den Klick-Knopf oder das Menü.
  - Mit „Bewegung reduzieren“ (iPhone: Einstellungen › Bedienungshilfen › Bewegung) parkt die Platte unten rechts.
  - Angehaltene Platte: „Ausblenden“ blendet sie aus, im Footer holt „Fliegende Platte zeigen“ sie zurück.
- [ ] Brixmap am Handy: Karte mit einem Finger bewegen, Ort empfehlen (antippen, suchen, „Mein Standort“), Formular absenden.
- [ ] Video auf Rise & Shine: Erst nach dem Klick lädt YouTube, die Musik der Seite pausiert dabei.
- [ ] Am Laptop in zwei Browsern.
- [ ] Link-Vorschau: den Link an dich selbst per WhatsApp schicken. Er sollte Bild, Name und Beschreibung zeigen. WhatsApp speichert Vorschauen im Cache, deshalb nach Änderungen notfalls mit `?v=2` testen.
- [ ] Lighthouse in den Chrome DevTools, Modus Mobil: mindestens 95 überall.

## 5. Gefunden werden

- [ ] Google Search Console: Domain-Property `johannesbrix.com` anlegen (Bestätigung per TXT-Record) und die Sitemap `https://johannesbrix.com/sitemap-index.xml` einreichen.
- [ ] Website-Link bei Instagram (bzw. im Linktree), LinkedIn (Kontaktinfos) und Strava (Profil) eintragen. Diese Querverweise helfen Google, deinen Namen mit der Seite zu verbinden.

## 6. Nach dem Launch

- [ ] Pages CMS einmal am Handy ausprobieren.
- [ ] Notieren, was beim ersten echten Beitrag hakt, und es in v1.1 verbessern.
