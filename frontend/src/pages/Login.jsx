import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { login } from "../api";
import LetterCard, { Label, Btn, Divider } from "../components/LetterCard";

export default function Login({ onAuth }) {
  const navigate = useNavigate();
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (!email || !password) { setError("Tous les champs sont requis."); return; }
    setLoading(true);
    try {
      await login({ email, password });
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
            <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>✉</div>
            <h2 style={h2Style}>Connexion</h2>
            <p style={metaStyle}>Accède à tes lettres reçues</p>
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

          <div style={{ marginBottom: "1.8rem" }}>
            <Label>Mot de passe</Label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
              style={inputStyle}
            />
          </div>

          {error && <p style={errStyle}>{error}</p>}

          <div style={{ textAlign: "center" }}>
            <Btn primary type="submit" disabled={loading}>
              {loading ? "Connexion…" : "Se connecter"}
            </Btn>
          </div>

          <Divider />

          <p style={{ textAlign: "center", fontFamily: "var(--ff-sans)", fontSize: "0.75rem", color: "var(--ink3)" }}>
            Pas encore de compte ?{" "}
            <Link to="/register" style={{ color: "var(--sepia)", textUnderlineOffset: 3 }}>
              Créer un compte
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