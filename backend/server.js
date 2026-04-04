const express = require("express");
const cors    = require("cors");

require("./db");

const authRouter    = require("./routes/auth");
const lettersRouter = require("./routes/letters");
const { rateLimiter } = require("./middleware/security");

const app  = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  methods: ["GET", "POST"],
}));
app.use(express.json());
app.use("/api", rateLimiter);

// ── Routes ────────────────────────────────────────────────────
app.use("/api/auth",    authRouter);
app.use("/api/letters", lettersRouter);

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

// ── Erreurs ───────────────────────────────────────────────────
app.use((_req, res) => res.status(404).json({ error: "Route introuvable." }));
app.use((err, _req, res, _next) => {
  console.error("Erreur serveur :", err);
  res.status(500).json({ error: "Erreur interne du serveur." });
});

app.listen(PORT, () => {
  console.log(`🚀 Serveur sur http://localhost:${PORT}`);
  console.log("   POST /api/auth/register");
  console.log("   POST /api/auth/login");
  console.log("   GET  /api/letters/inbox");
  console.log("   POST /api/letters");
  console.log("   GET  /api/letters/:id");
});