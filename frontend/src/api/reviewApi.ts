const API_URL = "http://localhost:3000";

/* =========================
   TYPER
========================= */

export interface Review {
  id: string;
  bookId: string;
  text: string;
  rating: number;
  createdAt: string;
  user: {
    id: string;
    username: string;
  };
  likesCount: number;
  isLikedByUser: boolean;
}

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginatedReviews {
  reviews: Review[];
  pagination: Pagination;
}

/* =========================
   HÄMTA RECENSIONER (med pagination)
========================= */

export async function getReviews(
  bookId: string,
  page: number = 1,
  limit: number = 5,
  sort: "asc" | "desc" = "desc"
): Promise<PaginatedReviews> {
  const response = await fetch(
    `${API_URL}/reviews/${bookId}?page=${page}&limit=${limit}&sort=${sort}`
  );

  if (!response.ok) {
    throw new Error("Kunde inte hämta recensioner");
  }

  return response.json();
}

/* =========================
   SKAPA RECENSION
========================= */

export async function createReview(
  token: string,
  data: { bookId: string; text: string; rating: number }
): Promise<Review> {
  const response = await fetch(`${API_URL}/reviews`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Kunde inte skapa recension");
  }

  return response.json();
}

/* =========================
   UPPDATERA RECENSION
========================= */

export async function updateReview(
  token: string,
  reviewId: string,
  data: { text: string; rating: number }
): Promise<Review> {
  const response = await fetch(`${API_URL}/reviews/${reviewId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Kunde inte uppdatera recension");
  }

  return response.json();
}

/* =========================
   RADERA RECENSION
========================= */

export async function deleteReview(
  token: string,
  reviewId: string
): Promise<void> {
  const response = await fetch(`${API_URL}/reviews/${reviewId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Kunde inte ta bort recension");
  }
}

/* =========================
   GILLA RECENSION
========================= */

export async function likeReview(
  token: string,
  reviewId: string
): Promise<{ message: string }> {
  const response = await fetch(
    `${API_URL}/reviews/${reviewId}/like`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Kunde inte gilla recension");
  }

  return response.json();
}

/* =========================
   TA BORT GILLA
========================= */

export async function unlikeReview(
  token: string,
  reviewId: string
): Promise<{ message: string }> {
  const response = await fetch(
    `${API_URL}/reviews/${reviewId}/like`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Kunde inte ta bort gilla");
  }

  return response.json();
}