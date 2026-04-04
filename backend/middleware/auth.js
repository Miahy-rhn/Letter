const jwt = require("jsonwebtoken");

const SECRET = process.env.JWT_SECRET || "change-this-secret-in-production";

// ── Génère un token signé ─────────────────────────────────────
// Expire dans 1h — le client doit se reconnecter régulièrement.
// Courte durée = fenêtre d'attaque réduite si un token est volé.
function signToken(userId) {
  return jwt.sign({ sub: userId }, SECRET, { expiresIn: "1h" });
}

// ── Middleware Express ────────────────────────────────────────
// Vérifie le header Authorization: Bearer <token>.
// En cas de succès, injecte req.userId pour les routes protégées.
// En cas d'échec, répond 401 — le client ne peut rien faire.
function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const token  = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: "Token manquant. Connecte-toi." });
  }

  try {
    // jwt.verify() utilise l'horloge SERVEUR pour contrôler exp.
    // Un client qui modifie son horloge locale n'a aucune prise ici.
    const payload = jwt.verify(token, SECRET);
    req.userId = payload.sub;
    next();
  } catch (err) {
    // TokenExpiredError ou JsonWebTokenError
    return res.status(401).json({ error: "Session expirée. Reconnecte-toi." });
  }
}

module.exports = { signToken, requireAuth };