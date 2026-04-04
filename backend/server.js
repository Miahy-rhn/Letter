const express = require("express");
const cors = require("cors");

// Initialise la base de données au démarrage
require("./db");

const lettersRouter = require("./routes/letters");
const { rateLimiter } = require("./middleware/security");

const app = express();
const PORT = process.env.PORT || 3001;

// ── Middlewares ───────────────────────────────
app.use(
  cors({
    // En développement on autorise le frontend Vite (port 5173)
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    methods: ["GET", "POST"],
  })
);
app.use(express.json());

// Rate limiting appliqué à toutes les routes /api/*
// Placé après CORS et json() mais avant les routes métier
app.use("/api", rateLimiter);

// ── Routes ────────────────────────────────────
app.use("/api/letters", lettersRouter);

// Route de santé (utile pour vérifier que l'API tourne)
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

// ── Gestion des routes inconnues ──────────────
app.use((_req, res) => {
  res.status(404).json({ error: "Route introuvable." });
});

// ── Gestion globale des erreurs ───────────────
app.use((err, _req, res, _next) => {
  console.error("Erreur serveur :", err);
  res.status(500).json({ error: "Erreur interne du serveur." });
});

// ── Démarrage ─────────────────────────────────
app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`);
  console.log(`   → POST /api/letters      créer une lettre`);
  console.log(`   → GET  /api/letters/:id  lire une lettre`);
  console.log(`   → GET  /api/health       vérifier l'API`);
});