import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import RatingSummary from "../components/RatingSummary";

/* =========================
   TYPER
========================= */

type GoogleBookDetails = {
  id: string;
  volumeInfo: {
    title: string;
    authors?: string[];
    description?: string;
    imageLinks?: {
      thumbnail?: string;
    };
    publishedDate?: string;
    publisher?: string;
  };
};

type Review = {
  id: string;
  text: string;
  rating: number;
  createdAt: string;
  user?: {
    email: string;
    id: string;
  };
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("sv-SE", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

/* =========================
   JWT HJÄLP
========================= */

const getUserIdFromToken = (token: string) => {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.userId;
  } catch {
    return null;
  }
};

export default function BookDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const { token, isAuthenticated } = useAuth();

  const currentUserId = token ? getUserIdFromToken(token) : null;

  const [book, setBook] = useState<GoogleBookDetails | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [newReview, setNewReview] = useState("");
  const [rating, setRating] = useState(5);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [editRating, setEditRating] = useState(5);

  const [loadingBook, setLoadingBook] = useState(false);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [readingStatus, setReadingStatus] = useState<string | null>(null);
  const [loadingStatus, setLoadingStatus] = useState(false);

  /* =========================
     HÄMTA BOK
  ========================= */

  useEffect(() => {
    const fetchBook = async () => {
      if (!id) return;

      setLoadingBook(true);
      setError(null);

      try {
        const apiKey = import.meta.env.VITE_GOOGLE_BOOKS_API_KEY;

        const response = await fetch(
          `https://www.googleapis.com/books/v1/volumes/${id}?key=${apiKey}`
        );

        if (!response.ok) {
          throw new Error("Kunde inte hämta bokdetaljer.");
        }

        const data = await response.json();
        setBook(data);
      } catch {
        setError("Ett fel uppstod vid hämtning av bok.");
      } finally {
        setLoadingBook(false);
      }
    };

    fetchBook();
  }, [id]);

  /* =========================
     HÄMTA RECENSIONER
  ========================= */

  const fetchReviews = async () => {
    if (!id) return;

    setLoadingReviews(true);

    try {
      const response = await fetch(
        `http://localhost:3000/reviews/${id}`
      );
      const data = await response.json();
      setReviews(data);
    } catch {
      console.error("Kunde inte hämta recensioner.");
    } finally {
      setLoadingReviews(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [id]);

  useEffect(() => {
  const fetchReadingStatus = async () => {
    if (!token || !id) return;

    setLoadingStatus(true);

    try {
      const response = await fetch(
        `http://localhost:3000/reading-status/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) return;

      const data = await response.json();

      if (data) {
        setReadingStatus(data.status);
      }
    } catch (error) {
      console.error("Kunde inte hämta lässtatus");
    } finally {
      setLoadingStatus(false);
    }
  };

  fetchReadingStatus();
}, [id, token]);

  /* =========================
     SKAPA RECENSION
  ========================= */

  const handleCreateReview = async () => {
    if (!token || !id || !newReview.trim()) return;

    try {
      const response = await fetch(
        "http://localhost:3000/reviews",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            bookId: id,
            text: newReview.trim(),
            rating,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Kunde inte skapa recension.");
      }

      setNewReview("");
      setRating(5);
      fetchReviews();
    } catch (error) {
      console.error("Fel vid skapande:", error);
    }
  };

  /* =========================
     UPPDATERA RECENSION
  ========================= */

  const handleUpdateReview = async (reviewId: string) => {
    if (!token) return;

    try {
      const response = await fetch(
        `http://localhost:3000/reviews/${reviewId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            text: editText,
            rating: editRating,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Kunde inte uppdatera recension.");
      }

      setEditingId(null);
      fetchReviews();
    } catch (error) {
      console.error("Fel vid uppdatering:", error);
    }
  };

  /* =========================
     TA BORT RECENSION
  ========================= */

  const handleDeleteReview = async (reviewId: string) => {
    if (!token) return;

    try {
      const response = await fetch(
        `http://localhost:3000/reviews/${reviewId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Kunde inte ta bort recension.");
      }

      fetchReviews();
    } catch (error) {
      console.error("Fel vid borttagning:", error);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
  if (!token || !id || !newStatus) return;

  try {
    const response = await fetch(
      "http://localhost:3000/reading-status",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          bookId: id,
          status: newStatus,
        }),
      }
    );

    if (!response.ok) {
      throw new Error("Kunde inte uppdatera status");
    }

    setReadingStatus(newStatus);
  } catch (error) {
    console.error("Fel vid uppdatering av status:", error);
  }
};

  /* =========================
     RENDER
  ========================= */

  if (loadingBook) return <p>Laddar bok...</p>;
if (error) return <p style={{ color: "red" }}>{error}</p>;
if (!book) return <p>Ingen bok hittades.</p>;

return (
  <div style={{ padding: "2rem" }}>
    <h1>{book.volumeInfo.title}</h1>

    {book.volumeInfo.authors && (
      <p>
        <strong>Författare:</strong>{" "}
        {book.volumeInfo.authors.join(", ")}
      </p>
    )}

    <hr style={{ margin: "2rem 0" }} />

    {isAuthenticated && (
  <div style={{ marginTop: "1.5rem" }}>
    <h3>Min lässtatus</h3>

    {loadingStatus ? (
      <p>Laddar status...</p>
    ) : (
      <select
        value={readingStatus ?? ""}
        onChange={(e) =>
          handleStatusChange(e.target.value)
        }
      >
        <option value="">Välj status</option>
        <option value="want_to_read">Vill läsa</option>
        <option value="reading">Läser</option>
        <option value="finished">Klar</option>
      </select>
    )}
  </div>
)}

    <h2>Recensioner</h2>

    <RatingSummary reviews={reviews} />

    {loadingReviews && <p>Laddar recensioner...</p>}

    {reviews.map((review) => {
      const isOwner = review.user?.id === currentUserId;

      return (
        <div
          key={review.id}
          style={{
            border: "1px solid #ccc",
            padding: "1rem",
            marginBottom: "1rem",
          }}
        >
          <strong>{review.user?.email}</strong>

          <p style={{ fontSize: "0.8rem", color: "#666" }}>
  {formatDate(review.createdAt)}
</p>

          {editingId === review.id ? (
            <>
              <textarea
                value={editText}
                onChange={(e) =>
                  setEditText(e.target.value)
                }
              />

              <select
                value={editRating}
                onChange={(e) =>
                  setEditRating(Number(e.target.value))
                }
              >
                {[1, 2, 3, 4, 5].map((num) => (
                  <option key={num} value={num}>
                    {num}
                  </option>
                ))}
              </select>

              <button
                onClick={() =>
                  handleUpdateReview(review.id)
                }
              >
                Spara
              </button>

              <button
                onClick={() => setEditingId(null)}
              >
                Avbryt
              </button>
            </>
          ) : (
            <>
              <p>Betyg: {review.rating} ⭐</p>
              <p>{review.text}</p>

              {isOwner && (
                <>
                  <button
                    onClick={() => {
                      setEditingId(review.id);
                      setEditText(review.text);
                      setEditRating(review.rating);
                    }}
                  >
                    Redigera
                  </button>

                  <button
                    onClick={() =>
                      handleDeleteReview(review.id)
                    }
                  >
                    Ta bort
                  </button>
                </>
              )}
            </>
          )}
        </div>
      );
    })}

    {isAuthenticated && (
      <div style={{ marginTop: "2rem" }}>
        <h3>Skriv recension</h3>

        <textarea
          value={newReview}
          onChange={(e) =>
            setNewReview(e.target.value)
          }
        />

        <select
          value={rating}
          onChange={(e) =>
            setRating(Number(e.target.value))
          }
        >
          {[1, 2, 3, 4, 5].map((num) => (
            <option key={num} value={num}>
              {num}
            </option>
          ))}
        </select>

        <button onClick={handleCreateReview}>
          Skicka recension
        </button>
      </div>
    )}
  </div>
);
}