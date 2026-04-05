const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001/api";

// ── Helpers token ─────────────────────────────────────────────
export function getToken()        { return localStorage.getItem("token"); }
export function setToken(t)       { localStorage.setItem("token", t); }
export function removeToken()     { localStorage.removeItem("token"); }
export function isAuthenticated() { return !!getToken(); }

// Header Authorization injecté automatiquement si token présent
function authHeaders() {
  const token = getToken();
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
}

// Gestion centralisée des erreurs HTTP
async function handleResponse(res) {
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Erreur inconnue.");
  return data;
}

// ── Auth ──────────────────────────────────────────────────────
export async function register({ email, password }) {
  const res = await fetch(`${BASE_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = await handleResponse(res);
  setToken(data.token);
  return data;
}

export async function login({ email, password }) {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = await handleResponse(res);
  setToken(data.token);
  return data;
}

export function logout() {
  removeToken();
}

// ── Lettres ───────────────────────────────────────────────────
export async function createLetter({ title, content, unlock_at, recipient_email }) {
  const res = await fetch(`${BASE_URL}/letters`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ title, content, unlock_at, recipient_email }),
  });
  return handleResponse(res);
}

// Boîte de réception — liste des lettres du compte connecté
// Ne contient jamais le contenu des lettres verrouillées
export async function fetchInbox() {
  const res = await fetch(`${BASE_URL}/letters/inbox`, {
    headers: authHeaders(),
  });
  return handleResponse(res);
}

// Lecture d'une lettre — le serveur décide locked/unlocked
export async function readLetter(id) {
  const res = await fetch(`${BASE_URL}/letters/${id}`, {
    headers: authHeaders(),
  });
  if (res.status === 404) return null;
  return handleResponse(res);
}