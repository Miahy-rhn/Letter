import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";

// ── Styles globaux injectés en JS ────────────────────────────
// (évite un fichier CSS séparé pour le MVP)
const style = document.createElement("style");
style.textContent = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400;1,600&family=Raleway:wght@300;400;500&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --cream:    #f5f0e8;
    --cream2:   #ede7d9;
    --ink:      #2c2416;
    --ink2:     #5a4e3a;
    --ink3:     #9a8c75;
    --sepia:    #8b6f47;
    --sepia2:   #c4a882;
    --red:      #8b2e2e;
    --ff-serif: 'Cormorant Garamond', Georgia, serif;
    --ff-sans:  'Raleway', sans-serif;
  }

  body {
    background: var(--cream);
    color: var(--ink);
    font-family: var(--ff-serif);
    min-height: 100vh;
  }

  /* Texture grain subtile sur toute la page */
  body::before {
    content: '';
    position: fixed;
    inset: 0;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)' opacity='0.03'/%3E%3C/svg%3E");
    pointer-events: none;
    z-index: 9999;
  }

  /* Animations globales */
  @keyframes unfold {
    0%   { opacity: 0; transform: scaleY(0.05) translateY(-45%); }
    65%  { transform: scaleY(1.015) translateY(0); opacity: 1; }
    100% { transform: scaleY(1); opacity: 1; }
  }
  @keyframes blink {
    0%, 100% { opacity: 1; }
    50%       { opacity: 0; }
  }
  @keyframes dotPulse {
    0%, 100% { opacity: 0.8; }
    50%       { opacity: 0.2; }
  }

  /* Focus visible accessible */
  :focus-visible { outline: 2px solid var(--sepia); outline-offset: 2px; }

  /* Scrollbar discrète */
  ::-webkit-scrollbar { width: 6px; }
  ::-webkit-scrollbar-track { background: var(--cream2); }
  ::-webkit-scrollbar-thumb { background: var(--sepia2); border-radius: 3px; }
`;
document.head.appendChild(style);

// ── Montage React ─────────────────────────────────────────────
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);