const sqlite3 = require("sqlite3").verbose();
const path    = require("path");

const DB_PATH = process.env.DB_PATH || path.join(__dirname, "letters.db");

// Création de la connexion
const db = new sqlite3.Database(DB_PATH, err => {
  if (err) {
    console.error("Erreur ouverture base de données :", err.message);
    process.exit(1);
  }
  console.log("✅ Base de données prête :", DB_PATH);
});

// Activation WAL et foreign keys
db.serialize(() => {
  db.run("PRAGMA journal_mode = WAL");
  db.run("PRAGMA foreign_keys = ON");

  // Table users
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id         TEXT PRIMARY KEY,
      email      TEXT NOT NULL UNIQUE,
      password   TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);

  // Table letters
  db.run(`
    CREATE TABLE IF NOT EXISTS letters (
      id              TEXT PRIMARY KEY,
      title           TEXT NOT NULL,
      content         TEXT NOT NULL,
      unlock_at       TEXT NOT NULL,
      recipient_email TEXT NOT NULL,
      created_at      TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);
});

// ── Helpers promesse ──────────────────────────────────────────
// sqlite3 est asynchrone — on enveloppe les méthodes courantes
// en promesses pour garder un code lisible avec async/await.

// Lecture d'une seule ligne
db.getAsync = (sql, params = []) =>
  new Promise((resolve, reject) =>
    db.get(sql, params, (err, row) => err ? reject(err) : resolve(row))
  );

// Lecture de plusieurs lignes
db.allAsync = (sql, params = []) =>
  new Promise((resolve, reject) =>
    db.all(sql, params, (err, rows) => err ? reject(err) : resolve(rows))
  );

// Insertion / mise à jour / suppression
db.runAsync = (sql, params = []) =>
  new Promise((resolve, reject) =>
    db.run(sql, params, function (err) {
      err ? reject(err) : resolve({ lastID: this.lastID, changes: this.changes });
    })
  );

module.exports = db;