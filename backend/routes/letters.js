const express  = require("express");
const { v4: uuidv4 } = require("uuid");
const db              = require("../db");
const { requireAuth } = require("../middleware/auth");
const { validateUUID } = require("../middleware/security");

const router = express.Router();

// ── POST /api/letters ─────────────────────────────────────────
router.post("/", requireAuth, async (req, res) => {
  const { title, content, unlock_at, recipient_email } = req.body;

  if (!title || !content || !unlock_at || !recipient_email) {
    return res.status(400).json({ error: "Tous les champs sont requis." });
  }

  const unlockDate = new Date(unlock_at);
  if (isNaN(unlockDate.getTime())) {
    return res.status(400).json({ error: "Date de déblocage invalide." });
  }
  if (unlockDate.getTime() <= Date.now()) {
    return res.status(400).json({ error: "La date de déblocage doit être dans le futur." });
  }

  try {
    const id = uuidv4();
    await db.runAsync(
      `INSERT INTO letters (id, title, content, unlock_at, recipient_email)
       VALUES (?, ?, ?, ?, ?)`,
      [id, title.trim(), content.trim(), unlockDate.toISOString(), recipient_email.toLowerCase().trim()]
    );

    return res.status(201).json({ id, link: `/letters/${id}` });

  } catch (err) {
    console.error("Erreur création lettre :", err);
    return res.status(500).json({ error: "Erreur interne du serveur." });
  }
});

// ── GET /api/letters/inbox ────────────────────────────────────
router.get("/inbox", requireAuth, async (req, res) => {
  try {
    const user = await db.getAsync(
      "SELECT email FROM users WHERE id = ?",
      [req.userId]
    );
    if (!user) return res.status(404).json({ error: "Utilisateur introuvable." });

    const letters = await db.allAsync(
      `SELECT id, title, unlock_at, created_at
       FROM letters
       WHERE recipient_email = ?
       ORDER BY created_at DESC`,
      [user.email]
    );

    const nowMs  = Date.now();
    const result = letters.map(l => {
      const remainingMs = new Date(l.unlock_at).getTime() - nowMs;
      const locked      = remainingMs > 0;
      return {
        id:         l.id,
        title:      l.title,
        unlock_at:  l.unlock_at,
        created_at: l.created_at,
        status:     locked ? "locked" : "unlocked",
        ...(locked && { remaining_ms: Math.ceil(remainingMs) }),
        server_time: new Date(nowMs).toISOString(),
      };
    });

    return res.status(200).json({ letters: result });

  } catch (err) {
    console.error("Erreur inbox :", err);
    return res.status(500).json({ error: "Erreur interne du serveur." });
  }
});

// ── GET /api/letters/:id ──────────────────────────────────────
router.get("/:id", requireAuth, validateUUID, async (req, res) => {
  try {
    const user = await db.getAsync(
      "SELECT email FROM users WHERE id = ?",
      [req.userId]
    );
    if (!user) return res.status(404).json({ error: "Utilisateur introuvable." });

    const letter = await db.getAsync(
      "SELECT * FROM letters WHERE id = ?",
      [req.params.id]
    );
    if (!letter) return res.status(404).json({ error: "Lettre introuvable." });

    if (letter.recipient_email !== user.email) {
      return res.status(403).json({ error: "Accès refusé." });
    }

    const nowMs       = Date.now();
    const remainingMs = new Date(letter.unlock_at).getTime() - nowMs;

    if (remainingMs > 0) {
      return res.status(200).json({
        status:       "locked",
        id:           letter.id,
        title:        letter.title,
        unlock_at:    letter.unlock_at,
        remaining_ms: Math.ceil(remainingMs),
        server_time:  new Date(nowMs).toISOString(),
      });
    }

    return res.status(200).json({
      status:      "unlocked",
      id:          letter.id,
      title:       letter.title,
      content:     letter.content,
      unlock_at:   letter.unlock_at,
      created_at:  letter.created_at,
      server_time: new Date(nowMs).toISOString(),
    });

  } catch (err) {
    console.error("Erreur lecture lettre :", err);
    return res.status(500).json({ error: "Erreur interne du serveur." });
  }
});

module.exports = router;