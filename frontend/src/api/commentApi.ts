const API_URL = import.meta.env.VITE_API_URL;

/* =========================
   HÄMTA KOMMENTARER
========================= */

export async function getComments(reviewId: string) {
  const res = await fetch(`${API_URL}/comments/${reviewId}`);

  if (!res.ok) {
    throw new Error("Kunde inte hämta kommentarer");
  }

  return res.json();
}

/* =========================
   SKAPA KOMMENTAR
========================= */

export async function createComment(
  token: string,
  reviewId: string,
  text: string
) {
  const res = await fetch(`${API_URL}/comments/${reviewId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ text }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "Kunde inte skapa kommentar");
  }

  return data;
}