const Database = require("better-sqlite3");
const path = require("path");

// Le fichier SQLite est créé automatiquement à la racine du backend
const DB_PATH = path.join(__dirname, "letters.db");

const db = new Database(DB_PATH);

// Activation des foreign keys et du mode WAL (meilleures performances)
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

// Création de la table si elle n'existe pas
db.exec(`
  CREATE TABLE IF NOT EXISTS letters (
    id          TEXT PRIMARY KEY,          -- UUID v4 (lien unique)
    title       TEXT NOT NULL,             -- Titre de la lettre
    content     TEXT NOT NULL,             -- Corps de la lettre
    unlock_at   TEXT NOT NULL,             -- ISO 8601 : date/heure de déblocage
    created_at  TEXT NOT NULL DEFAULT (datetime('now'))
  );
`);

console.log(`✅ Base de données prête : ${DB_PATH}`);

module.exports = db;