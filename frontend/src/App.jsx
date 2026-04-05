import { useState } from "react";
import { BrowserRouter, Routes, Route, Link, useLocation, useNavigate, Navigate } from "react-router-dom";
import { isAuthenticated, logout } from "./api";
import Create   from "./pages/Create";
import Read     from "./pages/Read";
import Login    from "./pages/Login";
import Register from "./pages/Register";
import Inbox    from "./pages/Inbox";

// ── Route protégée ────────────────────────────────────────────
// Redirige vers /login si l'utilisateur n'est pas connecté
function PrivateRoute({ auth, children }) {
  return auth ? children : <Navigate to="/login" replace />;
}

// ── Page d'accueil ────────────────────────────────────────────
function Home({ auth }) {
  return (
    <main style={{ maxWidth: 520, margin: "0 auto", padding: "2rem 1.2rem 4rem", textAlign: "center" }}>
      <p style={{
        fontSize: "clamp(1rem,2.5vw,1.15rem)", fontStyle: "italic",
        color: "var(--ink2)", lineHeight: 1.85, fontWeight: 300, marginBottom: "2.5rem",
      }}>
        Écris une lettre à quelqu'un.<br />
        Elle ne pourra être lue qu'au moment choisi.
      </p>

      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.9rem" }}>
        {auth ? (
          <>
            <Link to="/create" style={primaryBtnStyle}>Écrire une lettre</Link>
            <Link to="/inbox"  style={secondaryBtnStyle}>Ma boîte de réception</Link>
          </>
        ) : (
          <>
            <Link to="/register" style={primaryBtnStyle}>Créer un compte</Link>
            <Link to="/login"    style={secondaryBtnStyle}>Se connecter</Link>
          </>
        )}
      </div>

      <div style={{ marginTop: "3.5rem", color: "#c4a882", fontFamily: "var(--ff-serif)", letterSpacing: "0.4em", fontSize: "0.85rem" }}>
        ✦ &nbsp; ✦ &nbsp; ✦
      </div>
    </main>
  );
}

// ── Header ────────────────────────────────────────────────────
function Header({ auth, onLogout }) {
  const location = useLocation();
  const navigate  = useNavigate();

  const subtitles = {
    "/create":   "rédaction",
    "/inbox":    "boîte de réception",
    "/login":    "connexion",
    "/register": "inscription",
  };
  const subtitle = subtitles[location.pathname]
    ?? (location.pathname.startsWith("/letters/") ? "lecture" : "correspondance différée");

  function handleLogout() {
    logout();
    onLogout();
    navigate("/");
  }

  return (
    <header style={{ textAlign: "center", paddingTop: "clamp(1.5rem,5vw,3rem)", paddingBottom: "1rem" }}>
      <Link to="/" style={{ textDecoration: "none", color: "inherit" }}>
        <div style={{ fontFamily: "var(--ff-sans)", fontSize: "clamp(.65rem,1.8vw,.75rem)", letterSpacing: ".35em", color: "var(--ink3)", textTransform: "uppercase", fontWeight: 300 }}>
          Lettre
        </div>
        <div style={{ fontSize: "clamp(1.8rem,6vw,2.8rem)", fontWeight: 300, fontStyle: "italic", letterSpacing: ".04em", lineHeight: 1 }}>
          Différée
        </div>
      </Link>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: ".8rem", marginTop: "1rem" }}>
        <span style={{ height: 1, width: 36, background: "#c4a882" }} />
        <span style={{ fontFamily: "var(--ff-sans)", fontSize: ".62rem", letterSpacing: ".22em", color: "var(--ink3)", textTransform: "uppercase", fontWeight: 400 }}>
          {subtitle}
        </span>
        <span style={{ height: 1, width: 36, background: "#c4a882" }} />
      </div>

      {/* Nav contextuelle — uniquement si connecté */}
      {auth && (
        <nav style={{ display: "flex", justifyContent: "center", gap: "1.4rem", marginTop: "0.9rem" }}>
          <Link to="/inbox"  style={navLinkStyle}>Réception</Link>
          <Link to="/create" style={navLinkStyle}>Écrire</Link>
          <button onClick={handleLogout} style={{ ...navLinkStyle, background: "none", border: "none", cursor: "pointer", padding: 0 }}>
            Déconnexion
          </button>
        </nav>
      )}
    </header>
  );
}

// ── App root ──────────────────────────────────────────────────
export default function App() {
  const [auth, setAuth] = useState(isAuthenticated());

  return (
    <BrowserRouter>
      <Header auth={auth} onLogout={() => setAuth(false)} />
      <Routes>
        <Route path="/"            element={<Home auth={auth} />} />
        <Route path="/login"       element={<Login    onAuth={() => setAuth(true)} />} />
        <Route path="/register"    element={<Register onAuth={() => setAuth(true)} />} />
        <Route path="/inbox"       element={<PrivateRoute auth={auth}><Inbox /></PrivateRoute>} />
        <Route path="/create"      element={<PrivateRoute auth={auth}><Create /></PrivateRoute>} />
        <Route path="/letters/:id" element={<PrivateRoute auth={auth}><Read /></PrivateRoute>} />
        <Route path="*"            element={<Navigate to="/" replace />} />
      </Routes>
      <footer style={{ textAlign: "center", padding: "2rem", color: "var(--ink3)", fontFamily: "var(--ff-sans)", fontSize: "0.62rem", letterSpacing: "0.1em" }}>
        Lettre Différée — correspondance à travers le temps
      </footer>
    </BrowserRouter>
  );
}

// ── Styles ────────────────────────────────────────────────────
const primaryBtnStyle = {
  display: "inline-block", background: "var(--ink)", color: "var(--cream)",
  border: "1px solid var(--ink)", padding: "0.6rem 2rem", borderRadius: 2,
  fontFamily: "var(--ff-sans)", fontSize: "0.7rem", letterSpacing: "0.14em",
  textTransform: "uppercase", textDecoration: "none",
};
const secondaryBtnStyle = {
  ...primaryBtnStyle, background: "transparent", color: "var(--ink)",
};
const navLinkStyle = {
  fontFamily: "var(--ff-sans)", fontSize: "0.65rem", letterSpacing: "0.12em",
  textTransform: "uppercase", color: "var(--ink3)", textDecoration: "none",
};