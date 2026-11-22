---
name: beitrag
description: Legt aus Johannes' ausgefüllter Vorlage (vorlagen/neuer-beitrag.md) einen neuen Beitrag oder ein Projekt-Update an, inklusive Bilder.
disable-model-invocation: true
argument-hint: "[Ordner oder Datei mit ausgefüllter Vorlage und Bildern, z. B. eingang/sauna]"
---

Lege aus `$ARGUMENTS` einen Inhalt für johannesbrix.com an.

## Vorher lesen
- `docs/inhalte.md`: Felder, Pfade, Bildregeln
- `vorlagen/neuer-beitrag.md`: so sieht die Vorlage aus

## Ablauf

1. **Vorlage lesen.** Feld „Art“ entscheidet:
   - **Beitrag:** neue Datei in `src/content/beitraege/`.
   - **Update:** Eintrag an `updates` eines bestehenden Beitrags anhängen. Finde den Beitrag über den Titel. Gibt es mehrere Treffer oder keinen, fragst du nach.
   - Momente gibt es seit 22.11.2026 nicht mehr. Steht dort noch „Moment“, fragst du, ob es ein Beitrag (Bereich Menschen & Community) werden soll.
2. **Text übernehmen, wörtlich.**
   - Du korrigierst nur eindeutige Tipp- und Rechtschreibfehler.
   - Nicht umformulieren, nichts kürzen, nichts ergänzen.
   - Keine Überschriften, Emojis oder Einleitungen erfinden.
   - Absätze bleiben, wie Johannes sie gesetzt hat.
   - Am Ende listest du jede Korrektur einzeln auf („alt“ → „neu“).
3. **Felder übersetzen.**
   - Bereich: Gourmet wird `gourmet`, Bauen wird `bauen`, Sport wird `sport`, Menschen & Community wird `menschen`.
   - Status: geplant wird `geplant`, läuft wird `laeuft`, fertig wird `fertig`, pausiert wird `pausiert`.
   - „Auf Startseite zeigen: ja“ wird `aktiv: true`.
   - „Zum Mitnehmen“ wird `mitnehmen` (wörtlich, wie die Story).
   - „Orte für die Brixmap“ wird `orte`: je Zeile `name`, `koordinaten` als `"48.13743, 11.57549"` und optional `notiz`.
   - Datum im Format `YYYY-MM-DD`. Fehlt das Datum, nimmst du das heutige.
   - Slug aus dem Titel: klein, ä→ae, ö→oe, ü→ue, ß→ss, Leerzeichen→Bindestrich. Existiert er schon, fragst du nach.
   - Leere Felder lässt du ganz weg.
4. **Bilder.**
   - Kopiere sie nach `src/assets/bilder/<slug>/` und gib ihnen sprechende Dateinamen (`titel.jpg`, `1.jpg` …).
   - Führe `npm run bilder -- src/assets/bilder/<slug>` aus. Das entfernt Metadaten und GPS und verkleinert auf 2400 px.
   - Schau dir jedes Bild an. Siehst du erkennbare Gesichter fremder Personen oder lesbare Kennzeichen, **stoppst du und fragst**. Du verpixelst nicht selbstständig.
   - Fehlt eine Bildbeschreibung, schlägst du eine sachliche vor („Was ist zu sehen?“) und markierst sie in deiner Zusammenfassung zur Bestätigung.
5. **Datei schreiben.** Frontmatter wie in `docs/inhalte.md`, die Bildpfade lauten `../../assets/bilder/<slug>/…`.
6. **Prüfen.**
   - `npm run build` muss grün sein.
   - Starte `npm run dev` und nenne die URL der neuen Seite.
   - Schau dir die Seite bei 390 px hell und dunkel an.
7. **Zusammenfassung an Johannes:** Datei und URL, übernommene Felder, Korrekturliste, vorgeschlagene Alt-Texte, offene Fragen.
8. **Erst nach seinem Okay** committen (`Beitrag: <Titel>` bzw. `Update: <Titel>`) und pushen. Vorher `git pull`, weil Johannes auch über Pages CMS direkt auf GitHub speichert. Nach dem Push ist der Inhalt in etwa 1 bis 2 Minuten live.

Die Original-Vorlage und die Bilder im Eingangsordner nicht committen. Der Ordner `eingang/` steht in `.gitignore`.
