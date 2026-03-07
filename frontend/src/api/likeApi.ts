const API_URL = import.meta.env.VITE_API_URL;

/* =========================
   GILLA RECENSION
========================= */

export async function likeReview(
  token: string,
  reviewId: string
): Promise<{ message: string }> {
  const res = await fetch(`${API_URL}/likes/${reviewId}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "Kunde inte gilla recension");
  }

  return data;
}

/* =========================
   TA BORT GILLA
========================= */

export async function unlikeReview(
  token: string,
  reviewId: string
): Promise<{ message: string }> {
  const res = await fetch(`${API_URL}/likes/${reviewId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "Kunde inte ta bort gilla");
  }

  return data;
}