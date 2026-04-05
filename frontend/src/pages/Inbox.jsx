import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { fetchInbox } from "../api";
import { Divider } from "../components/LetterCard";

// Formate remaining_ms en texte lisible
function formatRemaining(ms) {
  const total = Math.floor(ms / 1000);
  const d = Math.floor(total / 86400);
  const h = Math.floor((total % 86400) / 3600);
  const m = Math.floor((total % 3600) / 60);
  if (d > 0) return `dans ${d}j ${h}h`;
  if (h > 0) return `dans ${h}h ${m}min`;
  return `dans ${m}min`;
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString("fr-FR", { dateStyle: "long" });
}

export default function Inbox() {
  const navigate = useNavigate();
  const [letters, setLetters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");

  useEffect(() => {
    fetchInbox()
      .then(data => setLetters(data.letters))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader />;

  if (error) return (
    <main style={mainStyle}>
      <p style={{ textAlign: "center", color: "var(--red)", fontFamily: "var(--ff-sans)", fontSize: "0.85rem" }}>
        {error}
      </p>
    </main>
  );

  return (
    <main style={mainStyle}>

      {/* En-tête boîte de réception */}
      <div style={{ marginBottom: "1.8rem" }}>
        <h2 style={{ fontSize: "clamp(1.1rem,3vw,1.4rem)", fontWeight: 300, fontStyle: "italic", color: "var(--ink2)" }}>
          {letters.length === 0
            ? "Aucune lettre reçue"
            : `${letters.length} lettre${letters.length > 1 ? "s" : ""} reçue${letters.length > 1 ? "s" : ""}`}
        </h2>
      </div>

      {/* Liste des lettres */}
      {letters.length === 0 ? (
        <div style={{
          textAlign: "center", padding: "3rem 1rem",
          color: "var(--ink3)", fontStyle: "italic", fontSize: "1rem",
          border: "1px dashed #d4bc9a", borderRadius: 2,
        }}>
          Personne ne t'a encore écrit.<br />
          <span style={{ fontSize: "0.8rem", fontStyle: "normal", fontFamily: "var(--ff-sans)", marginTop: "0.5rem", display: "block" }}>
            Partage ton adresse email à quelqu'un qui voudra t'écrire.
          </span>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {letters.map(letter => (
            <LetterRow
              key={letter.id}
              letter={letter}
              onClick={() => navigate(`/letters/${letter.id}`)}
            />
          ))}
        </div>
      )}
    </main>
  );
}

// ── Ligne de lettre ───────────────────────────────────────────
function LetterRow({ letter, onClick }) {
  const locked = letter.status === "locked";

  return (
    <button
      onClick={onClick}
      style={{
        width: "100%",
        background: "#faf7f2",
        border: `1px solid ${locked ? "#d4bc9a" : "#8b6f47"}`,
        borderRadius: 2,
        padding: "1rem 1.2rem",
        cursor: "pointer",
        textAlign: "left",
        display: "flex",
        alignItems: "center",
        gap: "1rem",
        transition: "box-shadow 0.15s, transform 0.15s",
        boxShadow: "0 2px 12px rgba(44,36,22,0.07)",
      }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 4px 20px rgba(44,36,22,0.13)"; e.currentTarget.style.transform = "translateY(-1px)"; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = "0 2px 12px rgba(44,36,22,0.07)"; e.currentTarget.style.transform = "none"; }}
    >
      {/* Icône statut */}
      <span style={{ fontSize: "1.4rem", flexShrink: 0, filter: locked ? "grayscale(0.4)" : "none" }}>
        {locked ? "🔒" : "✉"}
      </span>

      {/* Contenu */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: "clamp(0.95rem,2.5vw,1.05rem)",
          fontWeight: 300, fontStyle: "italic",
          color: "var(--ink)",
          whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
        }}>
          {letter.title}
        </div>
        <div style={{ fontFamily: "var(--ff-sans)", fontSize: "0.68rem", color: "var(--ink3)", marginTop: "0.2rem" }}>
          Reçue le {formatDate(letter.created_at)}
        </div>
      </div>

      {/* Badge statut */}
      <span style={{
        flexShrink: 0,
        fontFamily: "var(--ff-sans)",
        fontSize: "0.62rem",
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        padding: "0.2rem 0.6rem",
        borderRadius: 2,
        background: locked ? "var(--cream2)" : "#f0ebe0",
        color: locked ? "var(--ink3)" : "var(--sepia)",
        border: `1px solid ${locked ? "#d4bc9a" : "#c4a882"}`,
        whiteSpace: "nowrap",
      }}>
        {locked ? formatRemaining(letter.remaining_ms) : "Lire"}
      </span>
    </button>
  );
}

function Loader() {
  return (
    <div style={{ display: "flex", gap: 6, justifyContent: "center", padding: "3rem" }}>
      {[0, 1, 2].map(i => (
        <span key={i} style={{
          width: 6, height: 6, borderRadius: "50%",
          background: "#c4a882", display: "inline-block",
          animation: `dotPulse 1.2s ${i * 0.2}s ease infinite`,
        }} />
      ))}
    </div>
  );
}

const mainStyle = { maxWidth: 600, margin: "0 auto", padding: "1rem 1.2rem 4rem" };
