import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { readLetter } from "../api";
import LetterCard, { Divider, Ornament, Btn } from "../components/LetterCard";
import Countdown from "../components/Countdown";
import Typewriter from "../components/Typewriter";

// ── États possibles ──────────────────────────────────────────
// loading → locked → (timer expire) → re-fetch → unlocked
// loading →                                       unlocked
// loading → error (404 ou réseau)

export default function Read() {
  const { id } = useParams();       // UUID depuis l'URL /letters/:id
  const navigate = useNavigate();
  const [state, setState]   = useState("loading");
  const [letter, setLetter] = useState(null);
  const [lockData, setLockData] = useState(null); // { unlock_at, server_time }

  // Fetch initial
  useEffect(() => {
    if (!id) { setState("error"); return; }
    fetchLetter();
  }, [id]);

  async function fetchLetter() {
    setState("loading");
    try {
      const data = await readLetter(id);
      if (!data) { setState("error"); return; }

      if (data.status === "locked") {
        setLockData({ unlock_at: data.unlock_at, server_time: data.server_time });
        setState("locked");
      } else {
        setLetter(data);
        setState("unlocked");
      }
    } catch {
      setState("error");
    }
  }

  // Appelé par <Countdown> quand le timer atteint zéro
  // On re-fetch pour laisser le serveur trancher définitivement
  function handleExpired() {
    fetchLetter();
  }

  // ── Rendu selon l'état ───────────────────────────────────────

  if (state === "loading") return <Loader />;

  if (state === "error") {
    return (
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
  }

  if (state === "locked") {
    const unlockFormatted = new Date(lockData.unlock_at).toLocaleString("fr-FR", {
      dateStyle: "long",
      timeStyle: "short",
    });

    return (
      <main style={mainStyle}>
        <LetterCard>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "2.6rem", marginBottom: "0.8rem" }}>🔒</div>
            <h2 style={h2Style}>Cette lettre est scellée</h2>
            <p style={{ fontSize: "0.72rem", color: "var(--ink3)", fontFamily: "var(--ff-sans)", marginTop: "0.4rem", fontWeight: 300 }}>
              Elle s'ouvrira le {unlockFormatted}
            </p>
          </div>

          <Divider />

          {/* Le countdown se synchronise sur l'heure serveur */}
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
  }

  // ── unlocked ────────────────────────────────────────────────
  const createdFormatted = letter.created_at
    ? new Date(letter.created_at).toLocaleDateString("fr-FR", { dateStyle: "long" })
    : "";

  return (
    <main style={mainStyle}>
      {/* animate déclenche l'animation de dépliage */}
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

        {/* Corps de la lettre avec effet machine à écrire */}
        <div style={{
          fontSize: "clamp(1rem, 2.5vw, 1.08rem)",
          lineHeight: 2,
          fontWeight: 300,
          color: "var(--ink2)",
          fontStyle: "italic",
          minHeight: "8rem",
        }}>
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
const h2Style   = { fontSize: "clamp(1.15rem, 4vw, 1.55rem)", fontWeight: 300, fontStyle: "italic", marginBottom: "0.4rem" };