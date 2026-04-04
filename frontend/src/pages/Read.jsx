import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { readLetter } from "../api";
import LetterCard, { Divider, Ornament, Btn } from "../components/LetterCard";
import Countdown from "../components/Countdown";
import Typewriter from "../components/Typewriter";

// ── États ────────────────────────────────────────────────────
// loading → preview → (bouton) → locked → (timer) → reading
//                             → (bouton) → reading

export default function Read() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [step, setStep]     = useState("loading"); // loading | preview | locked | reading | error
  const [letter, setLetter] = useState(null);
  const [lockData, setLockData] = useState(null);

  useEffect(() => {
    if (!id) { setStep("error"); return; }
    fetchLetter();
  }, [id]);

  async function fetchLetter() {
    try {
      const data = await readLetter(id);
      if (!data) { setStep("error"); return; }

      if (data.status === "locked") {
        setLockData({ unlock_at: data.unlock_at, server_time: data.server_time });
      } else {
        setLetter(data);
      }
      // Dans tous les cas on passe par la page d'accueil de la lettre
      setStep("preview");
    } catch {
      setStep("error");
    }
  }

  // Le destinataire appuie sur "Ouvrir la lettre"
  function handleOpen() {
    if (letter) {
      setStep("reading");
    } else {
      setStep("locked");
    }
  }

  // Quand le timer expire → re-fetch puis lecture
  async function handleExpired() {
    try {
      const data = await readLetter(id);
      if (data?.status === "unlocked") {
        setLetter(data);
        setStep("reading");
      }
    } catch {}
  }

  // ── Loading ──────────────────────────────────────────────────
  if (step === "loading") return <Loader />;

  // ── Erreur ───────────────────────────────────────────────────
  if (step === "error") return (
    <main style={mainStyle}>
      <LetterCard>
        <div style={{ textAlign: "center", padding: "1rem 0" }}>
          <p style={{ fontStyle: "italic", color: "var(--ink3)", fontSize: "1.05rem" }}>
            Cette lettre est introuvable.
          </p>
          <div style={{ marginTop: "1.5rem" }}>
            <Btn small onClick={() => navigate("/")}>Retour à l'accueil</Btn>
          </div>
        </div>
      </LetterCard>
    </main>
  );

  // ── Page d'accueil de la lettre (preview) ────────────────────
  if (step === "preview") {
    const isLocked = !letter;
    const unlockDate = lockData
      ? new Date(lockData.unlock_at).toLocaleString("fr-FR", { dateStyle: "long", timeStyle: "short" })
      : null;
    const createdDate = letter?.created_at
      ? new Date(letter.created_at).toLocaleDateString("fr-FR", { dateStyle: "long" })
      : null;

    return (
      <main style={mainStyle}>
        <LetterCard>
          <div style={{ textAlign: "center", padding: "0.5rem 0" }}>

            {/* Icône */}
            <div style={{ fontSize: "3rem", marginBottom: "1.2rem" }}>
              {isLocked ? "🔒" : "✉"}
            </div>

            {/* Titre de la lettre */}
            <h2 style={{ fontSize: "clamp(1.2rem,4vw,1.7rem)", fontWeight: 300, fontStyle: "italic", lineHeight: 1.3, marginBottom: "0.6rem" }}>
              {letter?.title ?? "Une lettre vous attend"}
            </h2>

            {/* Infos contextuelles */}
            {createdDate && (
              <p style={metaStyle}>Écrite le {createdDate}</p>
            )}
            {isLocked && unlockDate && (
              <p style={{ ...metaStyle, color: "var(--sepia)" }}>
                S'ouvrira le {unlockDate}
              </p>
            )}
            {!isLocked && (
              <p style={{ ...metaStyle, color: "var(--sepia)" }}>
                Prête à être lue
              </p>
            )}
          </div>

          <Divider />

          {/* Bouton principal */}
          <div style={{ textAlign: "center" }}>
            <Btn primary onClick={handleOpen}>
              Ouvrir la lettre
            </Btn>
          </div>

        </LetterCard>
      </main>
    );
  }

  // ── Compte à rebours ─────────────────────────────────────────
  if (step === "locked") return (
    <main style={mainStyle}>
      <LetterCard>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "2.6rem", marginBottom: "0.8rem" }}>🔒</div>
          <h2 style={h2Style}>Cette lettre est scellée</h2>
          <p style={metaStyle}>
            Elle s'ouvrira le {new Date(lockData.unlock_at).toLocaleString("fr-FR", { dateStyle: "long", timeStyle: "short" })}
          </p>
        </div>

        <Divider />

        <Countdown
          unlockAt={lockData.unlock_at}
          serverTime={lockData.server_time}
          onExpired={handleExpired}
        />

        <Divider />

        <p style={{ textAlign: "center", fontStyle: "italic", color: "var(--ink3)", fontSize: "0.9rem", lineHeight: 1.8 }}>
          Reviens à ce moment.<br />La lettre t'attendra.
        </p>
      </LetterCard>
    </main>
  );

  // ── Lecture ──────────────────────────────────────────────────
  const createdFormatted = letter.created_at
    ? new Date(letter.created_at).toLocaleDateString("fr-FR", { dateStyle: "long" })
    : "";

  return (
    <main style={mainStyle}>
      <LetterCard animate>
        <div style={{ marginBottom: "1.6rem" }}>
          <h2 style={{ fontSize: "clamp(1.2rem,4vw,1.75rem)", fontWeight: 300, fontStyle: "italic", lineHeight: 1.3, marginBottom: "0.4rem" }}>
            {letter.title}
          </h2>
          {createdFormatted && (
            <p style={{ fontSize: "0.7rem", color: "var(--ink3)", fontFamily: "var(--ff-sans)", letterSpacing: "0.05em" }}>
              Écrite le {createdFormatted}
            </p>
          )}
        </div>

        <Divider />

        <div style={{ fontSize: "clamp(1rem,2.5vw,1.08rem)", lineHeight: 2, fontWeight: 300, color: "var(--ink2)", fontStyle: "italic", minHeight: "8rem" }}>
          <Typewriter text={letter.content} speed={18} />
        </div>

        <Divider />

        <div style={{ textAlign: "right" }}>
          <Ornament small />
        </div>
      </LetterCard>
    </main>
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
const h2Style   = { fontSize: "clamp(1.15rem,4vw,1.55rem)", fontWeight: 300, fontStyle: "italic", marginBottom: "0.4rem" };
const metaStyle = { fontSize: "0.75rem", color: "var(--ink3)", fontFamily: "var(--ff-sans)", fontWeight: 300, marginTop: "0.3rem", letterSpacing: "0.04em" };