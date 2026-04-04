const Database = require("better-sqlite3");
const path     = require("path");

const DB_PATH = path.join(__dirname, "letters.db");
const db      = new Database(DB_PATH);

db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

db.exec(`
  -- Comptes utilisateurs (destinataires)
  CREATE TABLE IF NOT EXISTS users (
    id         TEXT PRIMARY KEY,
    email      TEXT NOT NULL UNIQUE,
    password   TEXT NOT NULL,          -- bcrypt hash
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  -- Lettres — recipient_email lie la lettre à un compte
  CREATE TABLE IF NOT EXISTS letters (
    id              TEXT PRIMARY KEY,
    title           TEXT NOT NULL,
    content         TEXT NOT NULL,
    unlock_at       TEXT NOT NULL,     -- ISO 8601 UTC, décidé par le serveur
    recipient_email TEXT NOT NULL,     -- doit correspondre à un users.email
    created_at      TEXT NOT NULL DEFAULT (datetime('now'))
  );
`);

console.log("✅ Base de données prête :", DB_PATH);

module.exports = db;