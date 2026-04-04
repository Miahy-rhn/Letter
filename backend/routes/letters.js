const express = require("express");
const { v4: uuidv4 } = require("uuid");
const db = require("../db");
const { validateUUID } = require("../middleware/security");

const router = express.Router();

// ─────────────────────────────────────────────
// POST /api/letters
// Crée une nouvelle lettre et retourne son lien
// ─────────────────────────────────────────────
router.post("/", (req, res) => {
  const { title, content, unlock_at } = req.body;

  // Validation des champs obligatoires
  if (!title || !content || !unlock_at) {
    return res.status(400).json({
      error: "Les champs title, content et unlock_at sont requis.",
    });
  }

  // Validation de la date : doit être dans le futur
  const unlockDate = new Date(unlock_at);
  if (isNaN(unlockDate.getTime())) {
    return res.status(400).json({ error: "La date unlock_at est invalide." });
  }
  if (unlockDate <= new Date()) {
    return res
      .status(400)
      .json({ error: "La date de déblocage doit être dans le futur." });
  }

  // Génération de l'identifiant unique
  const id = uuidv4();

  // Insertion en base
  const stmt = db.prepare(
    "INSERT INTO letters (id, title, content, unlock_at) VALUES (?, ?, ?, ?)"
  );
  stmt.run(id, title.trim(), content.trim(), unlockDate.toISOString());

  return res.status(201).json({
    id,
    message: "Lettre créée avec succès.",
    // Le frontend construira l'URL complète avec cet id
    link: `/letters/${id}`,
  });
});

// ─────────────────────────────────────────────
// GET /api/letters/:id
// Retourne le statut de la lettre
// • Avant déblocage : remaining_ms uniquement (pas de contenu !)
// • Après déblocage  : contenu complet
// ─────────────────────────────────────────────
// validateUUID s'exécute avant le handler : un UUID malformé est
// rejeté immédiatement, sans jamais toucher la base de données.
router.get("/:id", validateUUID, (req, res) => {
  const { id } = req.params;

  const letter = db
    .prepare("SELECT * FROM letters WHERE id = ?")
    .get(id);

  if (!letter) {
    return res.status(404).json({ error: "Lettre introuvable." });
  }

  // ── Vérification temporelle autoritaire ──────────────────────
  //  On utilise Date.now() (horloge du serveur).
  //  Peu importe ce que le client pense de l'heure : c'est notre
  //  serveur qui décide. Un client qui modifie son horloge locale
  //  ou qui forge une requête n'a aucune prise sur cette valeur.
  const nowMs = Date.now();
  const unlockMs = new Date(letter.unlock_at).getTime();
  const remainingMs = unlockMs - nowMs;

  if (remainingMs > 0) {
    return res.status(200).json({
      status: "locked",
      unlock_at: letter.unlock_at,
      remaining_ms: Math.ceil(remainingMs),
      // On expose l'heure du serveur : le frontend peut ainsi
      // corriger son compte à rebours par rapport à sa propre horloge
      server_time: new Date(nowMs).toISOString(),
    });
  }

  // La lettre est débloquée : on renvoie tout
  return res.status(200).json({
    status: "unlocked",
    id: letter.id,
    title: letter.title,
    content: letter.content,
    unlock_at: letter.unlock_at,
    created_at: letter.created_at,
    server_time: new Date(nowMs).toISOString(),
  });
});

module.exports = router;