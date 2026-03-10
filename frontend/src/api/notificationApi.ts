const API_URL = import.meta.env.VITE_API_URL;

/* =========================
   HÄMTA NOTIFICATIONER
========================= */

export async function getNotifications(token: string) {

  if (!token) return [];

  const res = await fetch(`${API_URL}/notifications`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) return [];

  return res.json();
}