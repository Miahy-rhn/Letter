const express = require("express");
const bcrypt  = require("bcrypt");
const { v4: uuidv4 } = require("uuid");
const db           = require("../db");
const { signToken } = require("../middleware/auth");

const router     = express.Router();
const SALT_ROUNDS = 12; // coût bcrypt — ~250ms sur hardware moderne

// Validation email basique
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ── POST /api/auth/register ───────────────────────────────────
router.post("/register", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email et mot de passe requis." });
  }
  if (!EMAIL_RE.test(email)) {
    return res.status(400).json({ error: "Email invalide." });
  }
  if (password.length < 8) {
    return res.status(400).json({ error: "Mot de passe trop court (8 caractères min)." });
  }

  // Vérifie si l'email est déjà pris
  const existing = db.prepare("SELECT id FROM users WHERE email = ?").get(email.toLowerCase());
  if (existing) {
    // On répond de façon identique à un succès pour ne pas révéler
    // si l'adresse existe déjà dans la base (énumération d'emails)
    return res.status(409).json({ error: "Un compte existe déjà avec cet email." });
  }

  // Hash bcrypt — le salt est intégré au hash, pas besoin de le stocker séparément
  const hashed = await bcrypt.hash(password, SALT_ROUNDS);
  const id     = uuidv4();

  db.prepare("INSERT INTO users (id, email, password) VALUES (?, ?, ?)")
    .run(id, email.toLowerCase(), hashed);

  const token = signToken(id);
  return res.status(201).json({ token, email: email.toLowerCase() });
});

// ── POST /api/auth/login ──────────────────────────────────────
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email et mot de passe requis." });
  }

  const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email.toLowerCase());

  // On compare même si l'utilisateur n'existe pas (évite le timing attack)
  const fakeHash = "$2b$12$invalidhashtopreventtimingattack000000000000000000000";
  const hash     = user ? user.password : fakeHash;
  const match    = await bcrypt.compare(password, hash);

  if (!user || !match) {
    // Message générique — ne révèle pas si c'est l'email ou le mdp qui est faux
    return res.status(401).json({ error: "Email ou mot de passe incorrect." });
  }

  const token = signToken(user.id);
  return res.status(200).json({ token, email: user.email });
});

module.exports = router;