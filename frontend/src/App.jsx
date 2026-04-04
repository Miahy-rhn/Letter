import { BrowserRouter, Routes, Route, Link, useLocation } from "react-router-dom";
import Create from "./pages/Create";
import Read from "./pages/Read";

// ── Page d'accueil ───────────────────────────────────────────
function Home() {
  return (
    <main style={{ maxWidth: 520, margin: "0 auto", padding: "2rem 1.2rem 4rem", textAlign: "center" }}>
      <p style={{
        fontSize: "clamp(1rem, 2.5vw, 1.15rem)", fontStyle: "italic",
        color: "var(--ink2)", lineHeight: 1.85, fontWeight: 300, marginBottom: "2.5rem",
      }}>
        Écris une lettre à quelqu'un.<br />
        Elle ne pourra être lue qu'au moment choisi.
      </p>
      <Link to="/create" style={primaryBtnStyle}>
        Écrire une lettre
      </Link>
      <div style={{ marginTop: "3.5rem", color: "#c4a882", fontFamily: "var(--ff-serif)", letterSpacing: "0.4em", fontSize: "0.85rem" }}>
        ✦ &nbsp; ✦ &nbsp; ✦
      </div>
    </main>
  );
}

// ── Header commun à toutes les pages ────────────────────────
function Header() {
  const location = useLocation();
  const isCreate  = location.pathname === "/create";
  const isRead    = location.pathname.startsWith("/letters/");
  const subtitle  = isCreate ? "rédaction" : isRead ? "lecture" : "correspondance différée";

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
    </header>
  );
}

// ── App root ─────────────────────────────────────────────────
export default function App() {
  return (
    <BrowserRouter>
      <Header />
      <Routes>
        <Route path="/"            element={<Home />} />
        <Route path="/create"      element={<Create />} />
        <Route path="/letters/:id" element={<Read />} />
        <Route path="*"            element={<Home />} />
      </Routes>
      <footer style={{ textAlign: "center", padding: "2rem", color: "var(--ink3)", fontFamily: "var(--ff-sans)", fontSize: "0.62rem", letterSpacing: "0.1em" }}>
        Lettre Différée — correspondance à travers le temps
      </footer>
    </BrowserRouter>
  );
}

const primaryBtnStyle = {
  display: "inline-block",
  background: "var(--ink)",
  color: "var(--cream)",
  border: "1px solid var(--ink)",
  padding: "0.6rem 2rem",
  borderRadius: 2,
  fontFamily: "var(--ff-sans)",
  fontSize: "0.7rem",
  letterSpacing: "0.14em",
  textTransform: "uppercase",
  textDecoration: "none",
  transition: "background 0.2s",
};