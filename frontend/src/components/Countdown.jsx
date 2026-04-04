import { useState, useEffect, useRef } from "react";

// Calcule le temps restant en ms, corrigé par le décalage
// entre l'horloge locale et l'horloge serveur.
function getRemainingMs(unlockAt, serverTime) {
  const unlockMs  = new Date(unlockAt).getTime();
  const serverNow = new Date(serverTime).getTime();
  const localNow  = Date.now();
  // skew = différence entre serveur et client (peut être négatif)
  const skew      = serverNow - localNow;
  // On utilise l'horloge locale corrigée par le skew
  return unlockMs - (localNow + skew);
}

function pad(n) {
  return String(Math.max(0, n)).padStart(2, "0");
}

function msToUnits(ms) {
  const total = Math.max(0, Math.floor(ms / 1000));
  return {
    d: Math.floor(total / 86400),
    h: Math.floor((total % 86400) / 3600),
    m: Math.floor((total % 3600) / 60),
    s: total % 60,
  };
}

// ─── Unité visuelle ───────────────────────────────────────────
function Unit({ value, label }) {
  return (
    <div style={{ textAlign: "center", minWidth: 52 }}>
      <div
        style={{
          fontSize: "clamp(1.8rem, 7vw, 2.8rem)",
          fontWeight: 300,
          lineHeight: 1,
          letterSpacing: "-0.02em",
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {pad(value)}
      </div>
      <div
        style={{
          fontFamily: "var(--ff-sans)",
          fontSize: "0.6rem",
          letterSpacing: "0.18em",
          color: "var(--ink3)",
          textTransform: "uppercase",
          marginTop: "0.2rem",
        }}
      >
        {label}
      </div>
    </div>
  );
}

// ─── Composant principal ──────────────────────────────────────
// Props :
//   unlockAt   – ISO string de la date de déblocage
//   serverTime – ISO string de l'heure serveur au moment de la réponse
//   onExpired  – callback appelé quand le timer atteint zéro
export default function Countdown({ unlockAt, serverTime, onExpired }) {
  const [remainingMs, setRemainingMs] = useState(
    () => getRemainingMs(unlockAt, serverTime)
  );
  const onExpiredRef = useRef(onExpired);
  onExpiredRef.current = onExpired;

  useEffect(() => {
    if (remainingMs <= 0) {
      onExpiredRef.current?.();
      return;
    }

    const id = setInterval(() => {
      setRemainingMs(prev => {
        const next = prev - 1000;
        if (next <= 0) {
          clearInterval(id);
          onExpiredRef.current?.();
          return 0;
        }
        return next;
      });
    }, 1000);

    return () => clearInterval(id);
  }, [unlockAt, serverTime]);

  const { d, h, m, s } = msToUnits(remainingMs);

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        gap: "clamp(0.6rem, 3vw, 1.8rem)",
      }}
    >
      {d > 0 && <Unit value={d} label={d > 1 ? "jours" : "jour"} />}
      <Unit value={h} label="h" />
      <Unit value={m} label="min" />
      <Unit value={s} label="sec" />
    </div>
  );
}