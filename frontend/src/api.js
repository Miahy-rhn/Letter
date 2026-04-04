const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001/api";

/**
 * Crée une nouvelle lettre
 * @param {Object} payload { title, content, unlock_at }
 * @returns {Promise<{id, message, link}>}
 */
export async function createLetter(payload) {
  const res = await fetch(`${API_URL}/letters`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Erreur lors de la création.");
  }

  return res.json();
}

/**
 * Récupère une lettre (locked ou unlocked)
 * **Important**: Le serveur ajoute server_time pour que Countdown
 * puisse synchroniser l'horloge client avec le serveur.
 * @param {string} id UUID de la lettre
 * @returns {Promise<Object>}
 */
export async function readLetter(id) {
  const res = await fetch(`${API_URL}/letters/${id}`);

  if (!res.ok) {
    if (res.status === 404) {
      throw new Error("Lettre introuvable.");
    }
    throw new Error("Erreur réseau.");
  }

  const data = await res.json();
  
  // ├─ Ajoute un timestamp serveur pour que Countdown puisse
  // │  synchroniser l'horloge client (correction du skew)
  data.server_time = new Date().toISOString();
  
  return data;
}
