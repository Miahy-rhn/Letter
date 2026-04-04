// ─────────────────────────────────────────────────────────────
//  Middleware de sécurité — Lettre Différée
//
//  Protections incluses :
//   1. Rate limiting en mémoire (pas de dépendance externe)
//   2. Validation du format UUID v4
//   3. Logging des accès suspects
// ─────────────────────────────────────────────────────────────

// ── 1. Rate limiter maison ────────────────────────────────────
//
//  Structure : Map  ip → { count, windowStart }
//  Fenêtre glissante de WINDOW_MS millisecondes.
//  Au-delà de MAX_REQUESTS dans la fenêtre → 429 Too Many Requests.
//
const WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS = 10;      // requêtes max par IP par fenêtre

const ipStore = new Map();

// Nettoyage périodique pour éviter les fuites mémoire :
// on supprime les entrées dont la fenêtre est expirée depuis longtemps.
setInterval(() => {
  const now = Date.now();
  for (const [ip, data] of ipStore.entries()) {
    if (now - data.windowStart > WINDOW_MS * 2) {
      ipStore.delete(ip);
    }
  }
}, WINDOW_MS);

function rateLimiter(req, res, next) {
  // Récupère l'IP réelle même derrière un proxy (Nginx, Heroku…)
  const ip = req.headers["x-forwarded-for"]?.split(",")[0].trim()
    ?? req.socket.remoteAddress
    ?? "unknown";

  const now = Date.now();
  const entry = ipStore.get(ip);

  if (!entry || now - entry.windowStart > WINDOW_MS) {
    // Première requête de cette IP, ou fenêtre expirée → on repart à zéro
    ipStore.set(ip, { count: 1, windowStart: now });
    return next();
  }

  entry.count += 1;

  if (entry.count > MAX_REQUESTS) {
    const retryAfterSec = Math.ceil((WINDOW_MS - (now - entry.windowStart)) / 1000);
    logSuspicious(ip, "RATE_LIMIT", req.originalUrl);

    return res.status(429).json({
      error: "Trop de requêtes. Réessaie dans un moment.",
      retry_after_seconds: retryAfterSec,
    });
  }

  return next();
}

// ── 2. Validation UUID v4 ─────────────────────────────────────
//
//  Un UUID v4 a la forme exacte :
//  xxxxxxxx-xxxx-4xxx-[89ab]xxx-xxxxxxxxxxxx
//  (la version "4" et le variant "[89ab]" sont fixes)
//
const UUID_V4_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function validateUUID(req, res, next) {
  const { id } = req.params;

  if (!id || !UUID_V4_REGEX.test(id)) {
    const ip = req.headers["x-forwarded-for"]?.split(",")[0].trim()
      ?? req.socket.remoteAddress
      ?? "unknown";

    logSuspicious(ip, "INVALID_UUID", req.originalUrl);

    // On répond 404 et non 400 : on ne confirme pas l'existence
    // d'un format valide attendu (sécurité par l'obscurité légère)
    return res.status(404).json({ error: "Lettre introuvable." });
  }

  next();
}

// ── 3. Logger des accès suspects ──────────────────────────────
//
//  En production, branche ici un vrai système de logs (Winston,
//  Datadog, Sentry…). Pour le MVP, la console suffit.
//
function logSuspicious(ip, reason, url) {
  console.warn(
    `[SECURITY] ${new Date().toISOString()} | ${reason} | IP: ${ip} | URL: ${url}`
  );
}

module.exports = { rateLimiter, validateUUID };