import { useState, useEffect } from "react";

// Affiche `text` caractère par caractère à la vitesse `speed` (ms/char).
// Quand la frappe est terminée, `onDone()` est appelé si fourni.
export default function Typewriter({ text = "", speed = 18, onDone }) {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    // Réinitialise si le texte change
    setDisplayed("");
    setDone(false);

    if (!text) return;

    let i = 0;
    const id = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) {
        clearInterval(id);
        setDone(true);
        onDone?.();
      }
    }, speed);

    return () => clearInterval(id);
  }, [text, speed]);

  return (
    <span>
      {/* Conserve les sauts de ligne du texte original */}
      {displayed.split("\n").map((line, idx, arr) => (
        <span key={idx}>
          {line}
          {idx < arr.length - 1 && <br />}
        </span>
      ))}
      {/* Curseur clignotant — disparaît une fois la frappe terminée */}
      {!done && (
        <span
          style={{
            display: "inline-block",
            width: "1.5px",
            height: "1em",
            background: "var(--sepia)",
            marginLeft: "2px",
            verticalAlign: "text-bottom",
            animation: "blink 0.65s ease infinite",
          }}
        />
      )}
    </span>
  );
}