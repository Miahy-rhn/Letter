import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createLetter } from "../api";
import LetterCard, { Divider, Label, Btn } from "../components/LetterCard";

// ── Helpers date ──────────────────────────────────────────────

function getTodayLocal() {
  const d = new Date();
  const p = n => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

function toISO(dateStr, timeStr) {
  return new Date(`${dateStr}T${timeStr}:00`).toISOString();
}

function formatDisplay(dateStr, timeStr) {
  const d = new Date(`${dateStr}T${timeStr}:00`);
  return d.toLocaleString("fr-FR", { dateStyle: "long", timeStyle: "short" });
}

// ── Créneaux horaires par période ─────────────────────────────
const TIME_GROUPS = [
  {
    label: "Matin",
    slots: ["06:00", "07:00", "08:00", "09:00", "10:00", "11:00"],
  },
  {
    label: "Après-midi",
    slots: ["12:00", "13:00", "14:00", "15:00", "16:00", "17:00"],
  },
  {
    label: "Soir",
    slots: ["18:00", "19:00", "20:00", "21:00", "22:00", "23:00"],
  },
  {
    label: "Nuit",
    slots: ["00:00", "01:00", "02:00", "03:00", "04:00", "05:00"],
  },
];

// ── Composant ─────────────────────────────────────────────────
export default function Create() {
  const navigate = useNavigate();
  const [title, setTitle]           = useState("");
  const [content, setContent]       = useState("");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [unlockDate, setUnlockDate] = useState("");
  const [unlockTime, setUnlockTime] = useState("12:00");
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState("");
  const [success, setSuccess]       = useState(null);
  const [copied, setCopied]         = useState(false);
  const textareaRef = useRef(null);

  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = ta.scrollHeight + "px";
  }, [content]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!title.trim() || !content.trim() || !unlockDate || !recipientEmail.trim()) {
      setError("Tous les champs sont requis."); return;
    }
    const chosen = new Date(`${unlockDate}T${unlockTime}:00`);
    if (chosen <= new Date()) {
      setError("La date de déblocage doit être dans le futur."); return;
    }

    setLoading(true);
    try {
      const data = await createLetter({
        title:           title.trim(),
        content:         content.trim(),
        unlock_at:       toISO(unlockDate, unlockTime),
        recipient_email: recipientEmail.trim(),
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
              setUnlockDate(""); setUnlockTime("12:00"); setRecipientEmail("");
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

  // ── Formulaire ────────────────────────────────────────────────
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

          {/* Message */}
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

          {/* Email destinataire */}
          <div style={{ marginBottom: "1.4rem" }}>
            <Label>Email du destinataire</Label>
            <input
              type="email"
              value={recipientEmail}
              onChange={e => setRecipientEmail(e.target.value)}
              placeholder="destinataire@example.com"
              style={{ ...inputStyle, fontFamily: "var(--ff-sans)", fontSize: "0.95rem" }}
            />
          </div>

          {/* Sélecteur de date */}
          <div style={{ marginBottom: "1.8rem" }}>
            <Label>Débloquer le</Label>

            {/* Champ date natif */}
            <input
              type="date"
              value={unlockDate}
              min={getTodayLocal()}
              onChange={e => setUnlockDate(e.target.value)}
              style={{ ...inputStyle, fontFamily: "var(--ff-sans)", fontSize: "0.95rem", marginBottom: "1.2rem" }}
            />

            {/* Groupes d'heures */}
            <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem", marginTop: "0.8rem" }}>
              {TIME_GROUPS.map(group => (
                <div key={group.label}>
                  <div style={{ fontFamily: "var(--ff-sans)", fontSize: "0.6rem", letterSpacing: "0.15em", color: "var(--ink3)", textTransform: "uppercase", marginBottom: "0.35rem" }}>
                    {group.label}
                  </div>
                  <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
                    {group.slots.map(slot => {
                      const selected = unlockTime === slot;
                      return (
                        <button
                          key={slot}
                          type="button"
                          onClick={() => setUnlockTime(slot)}
                          style={{
                            padding: "0.3rem 0.65rem",
                            borderRadius: 2,
                            border: `1px solid ${selected ? "var(--ink)" : "#d4bc9a"}`,
                            background: selected ? "var(--ink)" : "transparent",
                            color: selected ? "var(--cream)" : "var(--ink2)",
                            fontFamily: "var(--ff-sans)",
                            fontSize: "0.75rem",
                            cursor: "pointer",
                            transition: "all 0.15s",
                          }}
                        >
                          {slot}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Récapitulatif lisible */}
            {unlockDate && (
              <p style={{ marginTop: "1rem", fontFamily: "var(--ff-sans)", fontSize: "0.78rem", color: "var(--sepia)", fontStyle: "italic" }}>
                La lettre s'ouvrira le {formatDisplay(unlockDate, unlockTime)}
              </p>
            )}
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

// ── Styles ────────────────────────────────────────────────────
const mainStyle  = { maxWidth: 600, margin: "0 auto", padding: "1rem 1.2rem 4rem" };
const h2Style    = { fontSize: "clamp(1.2rem, 4vw, 1.6rem)", fontWeight: 300, fontStyle: "italic" };
const inputStyle = {
  width: "100%", background: "transparent", border: "none",
  borderBottom: "1px solid #d4bc9a", padding: "0.45rem 0",
  fontFamily: "var(--ff-serif)", fontSize: "clamp(0.95rem, 2.5vw, 1.05rem)",
  color: "var(--ink)", outline: "none",
};
const copyRowStyle  = { background: "var(--cream2)", borderRadius: 2, padding: "0.75rem 0.9rem", display: "flex", gap: "0.6rem", alignItems: "center" };
const copyUrlStyle  = { fontFamily: "var(--ff-sans)", fontSize: "0.72rem", color: "var(--ink2)", wordBreak: "break-all", flex: 1 };
const copyBtnStyle  = copied => ({
  background: copied ? "var(--sepia)" : "var(--ink)", color: "var(--cream)",
  border: "none", cursor: "pointer", padding: "0.35rem 0.85rem", borderRadius: 2,
  fontFamily: "var(--ff-sans)", fontSize: "0.65rem", letterSpacing: "0.08em",
  whiteSpace: "nowrap", transition: "background 0.2s",
});