const express  = require("express");
const { v4: uuidv4 } = require("uuid");
const db              = require("../db");
const { requireAuth } = require("../middleware/auth");
const { validateUUID } = require("../middleware/security");

const router = express.Router();

// ── POST /api/letters ─────────────────────────────────────────
// Crée une lettre. L'auteur doit être connecté.
// Le champ recipient_email désigne le destinataire.
router.post("/", requireAuth, (req, res) => {
  const { title, content, unlock_at, recipient_email } = req.body;

  if (!title || !content || !unlock_at || !recipient_email) {
    return res.status(400).json({ error: "Tous les champs sont requis." });
  }

  // ── Vérification temporelle autoritaire ──────────────────────
  // On parse la date reçue et on la compare à Date.now() CÔTÉ SERVEUR.
  // Le client envoie une chaîne ISO UTC — on ne lui fait pas confiance
  // pour décider si la date est dans le futur : c'est nous qui tranchons.
  const unlockDate = new Date(unlock_at);
  if (isNaN(unlockDate.getTime())) {
    return res.status(400).json({ error: "Date de déblocage invalide." });
  }
  if (unlockDate.getTime() <= Date.now()) {
    return res.status(400).json({ error: "La date de déblocage doit être dans le futur." });
  }

  const id = uuidv4();
  db.prepare(`
    INSERT INTO letters (id, title, content, unlock_at, recipient_email)
    VALUES (?, ?, ?, ?, ?)
  `).run(id, title.trim(), content.trim(), unlockDate.toISOString(), recipient_email.toLowerCase().trim());

  return res.status(201).json({ id, link: `/letters/${id}` });
});

// ── GET /api/inbox ────────────────────────────────────────────
// Liste les lettres du destinataire connecté.
// ⚠️  Ne renvoie JAMAIS le contenu des lettres verrouillées.
//     Le statut et remaining_ms sont calculés par le serveur — pas le client.
router.get("/inbox", requireAuth, (req, res) => {
  // On récupère l'email depuis la base via l'userId du token JWT
  const user = db.prepare("SELECT email FROM users WHERE id = ?").get(req.userId);
  if (!user) return res.status(404).json({ error: "Utilisateur introuvable." });

  const letters = db.prepare(`
    SELECT id, title, unlock_at, created_at
    FROM letters
    WHERE recipient_email = ?
    ORDER BY created_at DESC
  `).all(user.email);

  // Pour chaque lettre, on calcule le statut CÔTÉ SERVEUR
  const nowMs = Date.now();
  const result = letters.map(l => {
    const unlockMs    = new Date(l.unlock_at).getTime();
    const remainingMs = unlockMs - nowMs;
    const locked      = remainingMs > 0;

    return {
      id:           l.id,
      title:        l.title,
      unlock_at:    l.unlock_at,
      created_at:   l.created_at,
      status:       locked ? "locked" : "unlocked",
      // remaining_ms uniquement si verrouillée — jamais de contenu ici
      ...(locked && { remaining_ms: Math.ceil(remainingMs) }),
      // server_time permet au frontend de corriger son affichage
      server_time:  new Date(nowMs).toISOString(),
    };
  });

  return res.status(200).json({ letters: result });
});

// ── GET /api/letters/:id ──────────────────────────────────────
// Lecture d'une lettre. Requiert auth + appartenir au destinataire.
// La décision locked/unlocked est prise par le serveur à cet instant.
router.get("/:id", requireAuth, validateUUID, (req, res) => {
  const user = db.prepare("SELECT email FROM users WHERE id = ?").get(req.userId);
  if (!user) return res.status(404).json({ error: "Utilisateur introuvable." });

  const letter = db.prepare("SELECT * FROM letters WHERE id = ?").get(req.params.id);
  if (!letter) return res.status(404).json({ error: "Lettre introuvable." });

  // Le destinataire ne peut lire que ses propres lettres
  if (letter.recipient_email !== user.email) {
    return res.status(403).json({ error: "Accès refusé." });
  }

  // ── Vérification temporelle serveur ──────────────────────────
  // Date.now() = horloge du serveur. Inaltérable par le client.
  const nowMs       = Date.now();
  const unlockMs    = new Date(letter.unlock_at).getTime();
  const remainingMs = unlockMs - nowMs;

  if (remainingMs > 0) {
    // Lettre verrouillée : on envoie uniquement les métadonnées
    return res.status(200).json({
      status:       "locked",
      id:           letter.id,
      title:        letter.title,
      unlock_at:    letter.unlock_at,
      remaining_ms: Math.ceil(remainingMs),
      server_time:  new Date(nowMs).toISOString(),
    });
  }

  // Lettre débloquée : contenu complet
  return res.status(200).json({
    status:      "unlocked",
    id:          letter.id,
    title:       letter.title,
    content:     letter.content,
    unlock_at:   letter.unlock_at,
    created_at:  letter.created_at,
    server_time: new Date(nowMs).toISOString(),
  });
});

module.exports = router;