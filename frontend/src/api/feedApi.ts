const API_URL = import.meta.env.VITE_API_URL;

/* =========================
   HÄMTA FEED
========================= */

export async function getFeed(token: string) {
  const res = await fetch(`${API_URL}/feed`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error("Kunde inte hämta feed");
  }

  return res.json();
}