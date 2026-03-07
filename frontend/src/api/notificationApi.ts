const API_URL = import.meta.env.VITE_API_URL;

/* =========================
   HÄMTA NOTIFICATIONER
========================= */

export async function getNotifications(token: string) {
  const res = await fetch(`${API_URL}/notifications`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error("Kunde inte hämta notifikationer");
  }

  return res.json();
}