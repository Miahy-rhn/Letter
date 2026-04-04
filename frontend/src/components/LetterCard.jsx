// Carte papier réutilisée sur toutes les pages.
// Accepte n'importe quel children.
// `animate` déclenche l'animation d'ouverture (dépliage).
export default function LetterCard({ children, animate = false }) {
  return (
    <div
      style={{
        background: "#faf7f2",
        border: "1px solid #d4bc9a",
        borderRadius: 2,
        padding: "clamp(1.4rem, 5vw, 2.4rem)",
        boxShadow: "0 6px 40px rgba(44,36,22,0.13), 0 1px 3px rgba(44,36,22,0.1)",
        position: "relative",
        overflow: "hidden",
        animation: animate ? "unfold 0.85s cubic-bezier(0.22, 1, 0.36, 1) both" : undefined,
      }}
    >
      {/* Filets décoratifs haut et bas */}
      <div
        style={{
          position: "absolute",
          top: 7,
          left: "1.4rem",
          right: "1.4rem",
          height: 1,
          background: "#e5ddd0",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: 7,
          left: "1.4rem",
          right: "1.4rem",
          height: 1,
          background: "#e5ddd0",
          pointerEvents: "none",
        }}
      />
      {children}
    </div>
  );
}

// ── Sous-composants utilitaires exportés séparément ───────────

export function Divider() {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "0.7rem",
        margin: "1.4rem 0",
      }}
    >
      <span style={{ flex: 1, height: 1, background: "#e5ddd0" }} />
      <span style={{ color: "#c4a882", fontSize: "0.55rem" }}>✦</span>
      <span style={{ flex: 1, height: 1, background: "#e5ddd0" }} />
    </div>
  );
}

export function Label({ children }) {
  return (
    <label
      style={{
        display: "block",
        fontFamily: "var(--ff-sans)",
        fontSize: "0.62rem",
        letterSpacing: "0.2em",
        color: "var(--ink3)",
        textTransform: "uppercase",
        marginBottom: "0.4rem",
        fontWeight: 400,
      }}
    >
      {children}
    </label>
  );
}

export function Ornament({ small = false }) {
  return (
    <span
      style={{
        color: "#c4a882",
        fontFamily: "var(--ff-serif)",
        letterSpacing: "0.4em",
        fontSize: small ? "0.7rem" : "0.85rem",
      }}
    >
      ✦ &nbsp; ✦ &nbsp; ✦
    </span>
  );
}

export function Btn({ children, primary, small, onClick, type = "button", disabled }) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={{
        background: primary ? "var(--ink)" : "transparent",
        color: primary ? "var(--cream)" : "var(--ink)",
        border: "1px solid var(--ink)",
        padding: small ? "0.38rem 1.1rem" : "0.6rem 2rem",
        borderRadius: 2,
        fontFamily: "var(--ff-sans)",
        fontSize: small ? "0.65rem" : "0.7rem",
        letterSpacing: "0.14em",
        textTransform: "uppercase",
        cursor: disabled ? "default" : "pointer",
        opacity: disabled ? 0.45 : 1,
        transition: "background 0.2s, color 0.2s",
      }}
    >
      {children}
    </button>
  );
}