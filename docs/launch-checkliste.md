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

- [x] Kostenloses Konto auf dash.cloudflare.com (über GitHub angemeldet, 22.11.2026).
- [x] Server eingerichtet: Datenbank, Geheimschlüssel, veröffentlicht unter https://johannesbrix-api.johannesbrix-api.workers.dev, Adresse in `src/lib/dienste.ts`.
- [ ] Ein langes Admin-Passwort festlegen (`npx wrangler secret put ADMIN_PASSWORT` im Ordner `api/`) und im Passwort-Manager speichern.
- [ ] Admin-Seite öffnen, anmelden, Lesezeichen am Handy setzen.
- [ ] Test: auf der Brixmap einen Ort empfehlen (erscheint sofort) und ihn wieder löschen, am freigeschalteten Handy direkt an der Ortskarte.

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
  - Beim Laden läuft nichts. Tippen auf Text, Menü, Karte oder Filter startet nichts.
  - Ein Tipp auf die fliegende Platte (oder Play im Footer) startet die Musik, die Platte beginnt sich zu drehen.
  - Antippen der fliegenden Platte hält alles an. Die Platte bleibt stehen, auch nach einem Seitenwechsel.
  - Erneutes Antippen spielt an derselben Stelle weiter.
  - Beim Wechsel auf eine Bereichsseite und zurück läuft die Musik ohne Unterbrechung.
  - Die Platte verdeckt nichts Wichtiges dauerhaft, z. B. den Klick-Knopf oder das Menü.
  - Mit „Bewegung reduzieren“ (iPhone: Einstellungen › Bedienungshilfen › Bewegung) parkt die Platte unten rechts.
  - Platten-Knopf im Footer-Player: blendet die fliegende Platte aus und wieder ein; ausgeblendet bleibt sie auch nach dem Neuladen weg.
- [ ] Brixmap am Handy: Karte mit einem Finger bewegen, Pin antippen (Ortskarte), Filter-Chips, „Empfehlen“: Karte unter den Pin schieben, suchen, „Mein Standort“, Formular absenden. Der Ort steht sofort auf der Karte.
- [ ] Brixmap-Admin am Handy: anmelden, „Dieses Gerät freischalten“. Danach auf der Karte einen eigenen Ort setzen (Pin in der Mitte ist die Sonne, der Ort erscheint orange) und eine Test-Empfehlung wieder löschen.
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
