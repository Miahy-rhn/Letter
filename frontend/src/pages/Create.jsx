import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createLetter } from "../api";
import LetterCard, { Divider, Label, Btn } from "../components/LetterCard";

// ── Helpers date ─────────────────────────────────────────────

// Date min pour le champ <input type="date"> = aujourd'hui en heure locale
function getTodayLocal() {
  const d = new Date();
  const p = n => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

// Génère les créneaux horaires toutes les 30 min : ["00:00","00:30",…,"23:30"]
function buildTimeSlots() {
  const slots = [];
  for (let h = 0; h < 24; h++) {
    slots.push(`${String(h).padStart(2, "0")}:00`);
    slots.push(`${String(h).padStart(2, "0")}:30`);
  }
  return slots;
}
const TIME_SLOTS = buildTimeSlots();

// Combine date locale "YYYY-MM-DD" + heure "HH:MM" → ISO UTC pour le backend
function toISO(dateStr, timeStr) {
  return new Date(`${dateStr}T${timeStr}:00`).toISOString();
}

// Formate pour l'affichage dans l'écran de succès
function formatDisplay(dateStr, timeStr) {
  const d = new Date(`${dateStr}T${timeStr}:00`);
  return d.toLocaleString("fr-FR", { dateStyle: "long", timeStyle: "short" });
}

// ── Composant ────────────────────────────────────────────────
export default function Create() {
  const navigate = useNavigate();
  const [title, setTitle]       = useState("");
  const [content, setContent]   = useState("");
  const [unlockDate, setUnlockDate] = useState(""); // "YYYY-MM-DD"
  const [unlockTime, setUnlockTime] = useState("12:00"); // "HH:MM"
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");
  const [success, setSuccess]   = useState(null);
  const [copied, setCopied]     = useState(false);
  const textareaRef = useRef(null);

  // Auto-resize textarea
  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = ta.scrollHeight + "px";
  }, [content]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!title.trim() || !content.trim() || !unlockDate) {
      setError("Tous les champs sont requis.");
      return;
    }

    // Vérification que la date+heure est dans le futur
    const chosen = new Date(`${unlockDate}T${unlockTime}:00`);
    if (chosen <= new Date()) {
      setError("La date de déblocage doit être dans le futur.");
      return;
    }

    setLoading(true);
    try {
      const data = await createLetter({
        title:     title.trim(),
        content:   content.trim(),
        unlock_at: toISO(unlockDate, unlockTime),
      });
      setSuccess(data);
    } catch (err) {
      setError(err.message || "Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  }

  function copyLink() {
    const url = `${window.location.origin}/letters/${success.id}`;
    navigator.clipboard.writeText(url).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  // ── Écran de succès ──────────────────────────────────────────
  if (success) {
    const url = `${window.location.origin}/letters/${success.id}`;
    const displayDate = unlockDate ? formatDisplay(unlockDate, unlockTime) : "";

    return (
      <main style={mainStyle}>
        <LetterCard animate>
          <div style={{ textAlign: "center", padding: "0.5rem 0 0.2rem" }}>
            <div style={{ fontSize: "2.4rem", marginBottom: "0.6rem" }}>✉</div>
            <h2 style={h2Style}>La lettre est scellée</h2>
            <p style={{ color: "var(--ink3)", fontFamily: "var(--ff-sans)", fontSize: "0.75rem", marginTop: "0.4rem", fontWeight: 300 }}>
              S'ouvrira le <strong style={{ fontWeight: 500, color: "var(--ink2)" }}>{displayDate}</strong>
            </p>
          </div>

          <Divider />

          <div style={copyRowStyle}>
            <span style={copyUrlStyle}>{url}</span>
            <button onClick={copyLink} style={copyBtnStyle(copied)}>
              {copied ? "Copié !" : "Copier"}
            </button>
          </div>

          <Divider />

          <div style={{ display: "flex", gap: "0.9rem", justifyContent: "center", flexWrap: "wrap" }}>
            <Btn small onClick={() => {
              setSuccess(null); setTitle(""); setContent("");
              setUnlockDate(""); setUnlockTime("12:00");
            }}>
              Nouvelle lettre
            </Btn>
            <Btn small primary onClick={() => navigate(`/letters/${success.id}`)}>
              Voir la page
            </Btn>
          </div>
        </LetterCard>
      </main>
    );
  }

  // ── Formulaire ───────────────────────────────────────────────
  return (
    <main style={mainStyle}>
      <form onSubmit={handleSubmit}>
        <LetterCard>

          {/* Titre */}
          <div style={{ marginBottom: "1.4rem" }}>
            <Label>Titre de la lettre</Label>
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Une pensée pour toi…"
              maxLength={100}
              style={inputStyle}
            />
          </div>

          {/* Contenu */}
          <div style={{ marginBottom: "1.4rem" }}>
            <Label>Message</Label>
            <textarea
              ref={textareaRef}
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder={"Quand tu liras ces mots…\n\n"}
              rows={8}
              style={{ ...inputStyle, resize: "none", lineHeight: 1.9, fontStyle: "italic", overflow: "hidden" }}
            />
          </div>

          {/* Date + heure séparées */}
          <div style={{ marginBottom: "1.8rem" }}>
            <Label>Débloquer le</Label>
            <div style={{ display: "flex", gap: "1rem", alignItems: "center", flexWrap: "wrap" }}>

              {/* Champ date */}
              <input
                type="date"
                value={unlockDate}
                min={getTodayLocal()}
                onChange={e => setUnlockDate(e.target.value)}
                style={{
                  ...inputStyle,
                  flex: "1 1 140px",
                  fontFamily: "var(--ff-sans)",
                  fontSize: "0.9rem",
                  minWidth: 0,
                }}
              />

              {/* Select heure — toutes les 30 min */}
              <select
                value={unlockTime}
                onChange={e => setUnlockTime(e.target.value)}
                style={{
                  ...inputStyle,
                  flex: "0 0 auto",
                  fontFamily: "var(--ff-sans)",
                  fontSize: "0.9rem",
                  cursor: "pointer",
                  appearance: "none",
                  paddingRight: "1.2rem",
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%239a8c75'/%3E%3C/svg%3E")`,
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "right 0 center",
                }}
              >
                {TIME_SLOTS.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>

            </div>
          </div>

          {error && (
            <p style={{ color: "var(--red)", fontFamily: "var(--ff-sans)", fontSize: "0.78rem", textAlign: "center", marginBottom: "1rem" }}>
              {error}
            </p>
          )}

          <div style={{ textAlign: "center" }}>
            <Btn primary type="submit" disabled={loading}>
              {loading ? "Scellement en cours…" : "Sceller la lettre"}
            </Btn>
          </div>

        </LetterCard>
      </form>
    </main>
  );
}

// ── Styles ───────────────────────────────────────────────────
const mainStyle = { maxWidth: 600, margin: "0 auto", padding: "1rem 1.2rem 4rem" };
const h2Style   = { fontSize: "clamp(1.2rem, 4vw, 1.6rem)", fontWeight: 300, fontStyle: "italic" };

const inputStyle = {
  width: "100%",
  background: "transparent",
  border: "none",
  borderBottom: "1px solid #d4bc9a",
  padding: "0.45rem 0",
  fontFamily: "var(--ff-serif)",
  fontSize: "clamp(0.95rem, 2.5vw, 1.05rem)",
  color: "var(--ink)",
  outline: "none",
};

const copyRowStyle = {
  background: "var(--cream2)", borderRadius: 2,
  padding: "0.75rem 0.9rem", display: "flex",
  gap: "0.6rem", alignItems: "center",
};
const copyUrlStyle = {
  fontFamily: "var(--ff-sans)", fontSize: "0.72rem",
  color: "var(--ink2)", wordBreak: "break-all", flex: 1,
};
const copyBtnStyle = (copied) => ({
  background: copied ? "var(--sepia)" : "var(--ink)",
  color: "var(--cream)", border: "none", cursor: "pointer",
  padding: "0.35rem 0.85rem", borderRadius: 2,
  fontFamily: "var(--ff-sans)", fontSize: "0.65rem",
  letterSpacing: "0.08em", whiteSpace: "nowrap",
  transition: "background 0.2s",
});