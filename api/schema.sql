-- Datenbank des kleinen Servers (Cloudflare D1). Mehrfach ausführbar.

-- Brixmap-Empfehlungen. status: neu (wartet auf Freigabe) | offen (auf der Karte) | besucht
CREATE TABLE IF NOT EXISTS orte (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  kategorie TEXT NOT NULL,
  notiz TEXT NOT NULL DEFAULT '',
  von TEXT NOT NULL DEFAULT '',
  lat REAL NOT NULL,
  lng REAL NOT NULL,
  status TEXT NOT NULL DEFAULT 'neu' CHECK (status IN ('neu', 'offen', 'besucht')),
  kommentar TEXT NOT NULL DEFAULT '',
  erstellt TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
  besucht_am TEXT
);
CREATE INDEX IF NOT EXISTS orte_status ON orte (status);

-- Klick-Zähler über alle Besucher
CREATE TABLE IF NOT EXISTS zaehler (
  name TEXT PRIMARY KEY,
  wert INTEGER NOT NULL DEFAULT 0
);
INSERT OR IGNORE INTO zaehler (name, wert) VALUES ('klicks', 0);

-- Grenzen gegen Missbrauch: Zähler pro Zeitfenster. Schlüssel enthalten nur einen täglich
-- wechselnden Hash der IP-Adresse; abgelaufene Einträge löscht der nächtliche Cron.
CREATE TABLE IF NOT EXISTS grenzen (
  schluessel TEXT PRIMARY KEY,
  anzahl INTEGER NOT NULL,
  bis INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS grenzen_bis ON grenzen (bis);
