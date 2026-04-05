const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001/api";

// ─── Créer une lettre ─────────────────────────────────────────
// Envoie title, content, unlock_at au backend.
// Retourne { id, link } ou lance une erreur.
export async function createLetter({ title, content, unlock_at }) {
  const res = await fetch(`${BASE_URL}/letters`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title, content, unlock_at }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "Erreur lors de la création.");
  }

  return data; // { id, link, message }
}

// ─── Lire une lettre ──────────────────────────────────────────
// Interroge le backend avec l'UUID du lien.
// Retourne :
//   { status: "locked",    unlock_at, remaining_ms, server_time }
//   { status: "unlocked",  id, title, content, unlock_at, created_at, server_time }
//   null si la lettre n'existe pas (404)
export async function readLetter(id) {
  const res = await fetch(`${BASE_URL}/letters/${id}`);

  if (res.status === 404) return null;

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "Erreur lors de la lecture.");
  }

  return data;
}