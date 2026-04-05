import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { register } from "../api";
import LetterCard, { Label, Btn, Divider } from "../components/LetterCard";

export default function Register({ onAuth }) {
  const navigate = useNavigate();
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm]   = useState("");
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!email || !password || !confirm) {
      setError("Tous les champs sont requis."); return;
    }
    if (password.length < 8) {
      setError("Mot de passe trop court (8 caractères min)."); return;
    }
    if (password !== confirm) {
      setError("Les mots de passe ne correspondent pas."); return;
    }

    setLoading(true);
    try {
      await register({ email, password });
      onAuth();
      navigate("/inbox");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={mainStyle}>
      <form onSubmit={handleSubmit}>
        <LetterCard>
          <div style={{ textAlign: "center", marginBottom: "1.6rem" }}>
            <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>✦</div>
            <h2 style={h2Style}>Créer un compte</h2>
            <p style={metaStyle}>Pour recevoir et lire tes lettres</p>
          </div>

          <div style={{ marginBottom: "1.2rem" }}>
            <Label>Adresse email</Label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="toi@example.com"
              autoComplete="email"
              style={inputStyle}
            />
          </div>

          <div style={{ marginBottom: "1.2rem" }}>
            <Label>Mot de passe</Label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="8 caractères minimum"
              autoComplete="new-password"
              style={inputStyle}
            />
          </div>

          <div style={{ marginBottom: "1.8rem" }}>
            <Label>Confirmer le mot de passe</Label>
            <input
              type="password"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              placeholder="••••••••"
              autoComplete="new-password"
              style={inputStyle}
            />
          </div>

          {error && <p style={errStyle}>{error}</p>}

          <div style={{ textAlign: "center" }}>
            <Btn primary type="submit" disabled={loading}>
              {loading ? "Création…" : "Créer mon compte"}
            </Btn>
          </div>

          <Divider />

          <p style={{ textAlign: "center", fontFamily: "var(--ff-sans)", fontSize: "0.75rem", color: "var(--ink3)" }}>
            Déjà un compte ?{" "}
            <Link to="/login" style={{ color: "var(--sepia)", textUnderlineOffset: 3 }}>
              Se connecter
            </Link>
          </p>
        </LetterCard>
      </form>
    </main>
  );
}

const mainStyle  = { maxWidth: 480, margin: "0 auto", padding: "1rem 1.2rem 4rem" };
const h2Style    = { fontSize: "clamp(1.2rem,4vw,1.5rem)", fontWeight: 300, fontStyle: "italic" };
const metaStyle  = { fontSize: "0.75rem", color: "var(--ink3)", fontFamily: "var(--ff-sans)", fontWeight: 300, marginTop: "0.3rem" };
const errStyle   = { color: "var(--red)", fontFamily: "var(--ff-sans)", fontSize: "0.78rem", textAlign: "center", marginBottom: "1rem" };
const inputStyle = {
  width: "100%", background: "transparent", border: "none",
  borderBottom: "1px solid #d4bc9a", padding: "0.45rem 0",
  fontFamily: "var(--ff-sans)", fontSize: "0.95rem",
  color: "var(--ink)", outline: "none",
};