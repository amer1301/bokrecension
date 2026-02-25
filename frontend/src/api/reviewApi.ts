const API_URL = "http://localhost:3000";

export async function getReviews(bookId: string) {
  const response = await fetch(`${API_URL}/reviews/${bookId}`);
  if (!response.ok) throw new Error("Kunde inte hämta recensioner");
  return response.json();
}

export async function createReview(
  token: string,
  data: { bookId: string; text: string; rating: number }
) {
  const response = await fetch(`${API_URL}/reviews`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) throw new Error("Kunde inte skapa recension");
  return response.json();
}

export async function updateReview(
  token: string,
  reviewId: string,
  data: { text: string; rating: number }
) {
  const response = await fetch(`${API_URL}/reviews/${reviewId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) throw new Error("Kunde inte uppdatera recension");
  return response.json();
}

export async function deleteReview(token: string, reviewId: string) {
  const response = await fetch(`${API_URL}/reviews/${reviewId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) throw new Error("Kunde inte ta bort recension");
}

export async function likeReview(
  token: string,
  reviewId: string
) {
  const response = await fetch(
    `http://localhost:3000/reviews/${reviewId}/like`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok)
    throw new Error("Kunde inte gilla");

  return response.json();
}

export async function unlikeReview(
  token: string,
  reviewId: string
) {
  const response = await fetch(
    `http://localhost:3000/reviews/${reviewId}/like`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok)
    throw new Error("Kunde inte ta bort gilla");

  return response.json();
}