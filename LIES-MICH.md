# Starter-Kit für johannesbrix.com

Das ist die Vorarbeit für Claude Code. Du kopierst alles in dein Website-Repo, startest Claude Code und gehst den Bauplan Phase für Phase durch.

Designrichtung: **B „Bild“**, überarbeitet mit deinen Notizen.

## Was drin ist

| Datei / Ordner | Wofür |
|---|---|
| `CLAUDE.md` | Projektgedächtnis. Claude Code liest es bei jedem Start automatisch: Regeln, Stack, Struktur |
| `docs/briefing.md` | alles, was wir besprochen haben, inklusive deiner Notizen |
| `docs/design.md` | das Designsystem für Richtung B: Farben, Schriften, Radien, Komponenten |
| `docs/referenz/` | Referenz-HTML und Screenshots für Startseite, Bereichsseite und Beitrag |
| `docs/inhalte.md` | Inhaltsmodell und Redaktionshandbuch: wie Beiträge aussehen und wie sie online kommen |
| `docs/bauplan.md` | 8 Phasen mit Prompts zum Kopieren |
| `docs/launch-checkliste.md` | Domain, DNS, Impressum, Tests, Google |
| `src/content/` | Startinhalte: 6 Projekte, 4 Bereiche mit deinen Untertiteln, Einstellungen mit deinen Links, deinem Rise-and-Shine-Text und dem Klick-Knopf. Texte in `[Klammern]` sind Platzhalter für dich |
| `src/assets/bilder/` | dein Porträt. Die Person im Hintergrund und die Kennzeichen sind unkenntlich gemacht, die Metadaten entfernt |
| `public/` | Favicon „JB“, Link-Vorschau-Bild (`og.jpg`), dein Song in `musik/` |
| `src/lib/musik.js` | Musik, Plattenteller und fliegende Platte, fertig und getestet |
| `.pages.yml` | Pages CMS: dein Redaktionsformular im Browser |
| `.claude/skills/beitrag/` | der Befehl `/beitrag` für Claude Code |
| `scripts/bilder.mjs` | entfernt Standort und Metadaten aus Fotos und verkleinert sie (getestet) |
| `vorlagen/` | Vorlage zum Ausfüllen für neue Beiträge, dazu ein Testbeispiel |

## So geht's los

1. **Repo anlegen.** Ein öffentliches GitHub-Repo, z. B. `website`. Klonen und den ganzen Kit-Inhalt hineinkopieren, auch die versteckten Dateien (`.pages.yml`, `.gitignore`, `.claude/`).
2. **Claude Code starten.** Im Ordner `claude` eingeben oder die Desktop-App nutzen. Dann die Phasen aus `docs/bauplan.md` durchgehen, eine pro Gespräch.
3. **Live gehen.** Ab Phase 6 hilft `docs/launch-checkliste.md`. Die DNS-Umstellung erledigst du früh, denn HTTPS kann bis zu 24 Stunden brauchen.
4. **Redaktion einrichten.** Unter https://app.pagescms.org mit GitHub anmelden und das Repo wählen. Fertig.

## Was noch fehlt

- [ ] **Klick-Zähler:** Soll „Y× geklickt“ nur die eigenen Klicks zählen (so ist es eingebaut) oder alle Besucher zusammen?
- [ ] **Deine Texte:**
  - Story je Projekt
  - Intro je Bereich (2 bis 4 Sätze)
  - Text für die Rise-and-Shine-Seite
  - deine Lieblingszitate
- [ ] **Fotos:** je Projekt ein Titelbild, je Bereich ein Foto. Für den Launch hat am besten jeder Bereich mindestens einen Beitrag, für Gourmet z. B. dein letztes Brot.

## Song und fliegende Platte

Dein Song ist eingebaut: „Gypsy Jazz“ von Aurec aus Pixabay (2:15 Minuten, läuft in Schleife). Die Pixabay Content License erlaubt die Nutzung kostenlos und ohne Namensnennung. Nur als einzelne Datei weiterverkaufen darfst du ihn nicht.

So verhält sich die Seite:
- Die Musik startet nur, wenn jemand auf eine Platte oder Play im Footer tippt (dein Wunsch vom 22.11.2026). Kein Autoplay, und Tippen irgendwo sonst auf der Seite startet nichts.
- Eine kleine Platte fliegt über den Bildschirm und prallt an den Rändern ab. Ein Tipp darauf startet die Musik. Nochmal antippen hält Musik und Platte an, sie bleibt dann an ihrer Stelle stehen.
- Der Player im Footer schaltet dieselbe Musik (Platte oder Play-Knopf). Der Platten-Knopf daneben blendet die fliegende Platte aus und wieder ein.
- Nach dem Anhalten geht es nie von vorn los. Platte und Song machen dort weiter, wo sie standen.
- Beim Seitenwechsel läuft die Musik weiter.
- Wer die Platte anhält, bei dem bleibt sie auch beim nächsten Besuch aus.
- Bei „Bewegung reduzieren“ fliegt und dreht sich nichts. Die Platte parkt dann unten rechts.

**Zitate:** Die Zitatkarte über „Wenn du mich klickst …“ zeigt von Anfang an ein Zitat; jeder Klick blendet zum nächsten über. Die Liste steht in `zitate.yml`. Sechs Zitate habe ich vorgeschlagen, deine zwei englischen Sprüche stehen am Ende. Tauschen geht auch in Pages CMS unter „Zitate“.

**Ausschalten oder Song tauschen** geht ohne Code in Pages CMS unter Allgemein › Name, Links und Musik: Schalter „Fliegende Platte“ oder eine neue Datei. Für einen neuen Song gilt: MP3, 128 bis 192 kbit/s, höchstens etwa 2 bis 3 MB, mit passender Lizenz, und Titel, Interpret und Lizenzhinweis eintragen.

## Neue Beiträge, ohne jedes Mal Claude Code zu fragen

Das läuft über **Pages CMS**. Du öffnest ein Formular im Browser (auch am Handy), füllst Titel, Bereich, Status, Story und Fotos aus und klickst auf Speichern. Nach etwa 1 bis 2 Minuten ist der Beitrag online. Updates zu Projekten trägst du genauso ein.

Wenn du lieber in Ruhe schreibst und Hilfe willst: Vorlage aus `vorlagen/` ausfüllen, Fotos danebenlegen und in Claude Code `/beitrag <ordner>` eingeben. Claude Code übernimmt deinen Text wörtlich und korrigiert nur Tippfehler.

Details zu beiden Wegen stehen in `docs/inhalte.md`.

## Fotos: drei Regeln

1. **In der Kamera-App das Speichern des Standorts ausschalten.** Sonst steckt in jedem Foto die GPS-Position, und das Repo ist öffentlich.
2. **Fremde Gesichter vor dem Hochladen in der Bilddatei verpixeln**, z. B. mit dem Bildeditor am Handy. Ein Unschärfe-Effekt auf der Website reicht nicht, weil das Original sonst trotzdem öffentlich im Repo läge. Noch besser: vorher fragen.
3. **Kennzeichen** genauso unkenntlich machen.

## Zeitplan bis zum 28. Oktober (Vorschlag)

| Wann | Was |
|---|---|
| Fr 23.10. | Phase 0 bis 2b: Repo, Gerüst, Startseite, Musik. Die DNS-Einträge aus der Launch-Checkliste heute schon setzen, weil HTTPS bis zu 24 Stunden braucht |
| Sa 24.10. | Phase 3 und 4: Bereiche, Beiträge, Rise & Shine |
| So 25.10. | Phase 5 und 6: Rechtliches, Feinschliff, live auf GitHub Pages |
| Mo 26.10. | Texte und Fotos einpflegen, Phase 7 (Pages CMS testen) |
| Di 27.10. | Launch-Checkliste, Link in die Instagram-Bio |
