const express  = require("express");
const bcrypt   = require("bcrypt");
const { v4: uuidv4 } = require("uuid");
const db            = require("../db");
const { signToken } = require("../middleware/auth");

const router      = express.Router();
const SALT_ROUNDS = 12;
const EMAIL_RE    = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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

  try {
    const existing = await db.getAsync(
      "SELECT id FROM users WHERE email = ?",
      [email.toLowerCase()]
    );
    if (existing) {
      return res.status(409).json({ error: "Un compte existe déjà avec cet email." });
    }

    const hashed = await bcrypt.hash(password, SALT_ROUNDS);
    const id     = uuidv4();

    await db.runAsync(
      "INSERT INTO users (id, email, password) VALUES (?, ?, ?)",
      [id, email.toLowerCase(), hashed]
    );

    const token = signToken(id);
    return res.status(201).json({ token, email: email.toLowerCase() });

  } catch (err) {
    console.error("Erreur register :", err);
    return res.status(500).json({ error: "Erreur interne du serveur." });
  }
});

// ── POST /api/auth/login ──────────────────────────────────────
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email et mot de passe requis." });
  }

  try {
    const user = await db.getAsync(
      "SELECT * FROM users WHERE email = ?",
      [email.toLowerCase()]
    );

    // Compare même si l'utilisateur n'existe pas (anti timing attack)
    const fakeHash = "$2b$12$invalidhashtopreventtimingattack000000000000000000000";
    const hash     = user ? user.password : fakeHash;
    const match    = await bcrypt.compare(password, hash);

    if (!user || !match) {
      return res.status(401).json({ error: "Email ou mot de passe incorrect." });
    }

    const token = signToken(user.id);
    return res.status(200).json({ token, email: user.email });

  } catch (err) {
    console.error("Erreur login :", err);
    return res.status(500).json({ error: "Erreur interne du serveur." });
  }
});

module.exports = router;