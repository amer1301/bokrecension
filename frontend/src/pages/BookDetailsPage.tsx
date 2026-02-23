import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

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
  user?: {
    email: string;
  };
};

/* =========================
   KOMPONENT
========================= */

export default function BookDetailsPage() {
    const { id } = useParams<{ id: string }>();
    const { token, isAuthenticated } = useAuth();

    const [book, setBook] = useState<GoogleBookDetails | null>(null);
    const [reviews, setReviews] = useState<Review[]>([]);
    const [newReview, setNewReview] = useState("");
    const [rating, setRating] = useState(5);

    const [loadingBook, setLoadingBook] = useState(false);
    const [loadingReviews, setLoadingReviews] = useState(false);
    const [error, setError] = useState<string | null>(null);

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

                if(!response.ok) {
                    throw new Error("Kunde inte hämta bokdetaljer.");
                }

                const data = await response.json();
                setBook(data);
            } catch (err) {
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
            text: newReview,
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
      console.error(error);
    }
  };

/* =========================
    RENDER LOGIK
========================= */

 if (loadingBook) return <p>Laddar bok...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;
  if (!book) return <p>Ingen bok hittades.</p>;

  /* =========================
     JSX
  ========================= */

    return (
    <div style={{ padding: "2rem" }}>
      <h1>{book.volumeInfo.title}</h1>

      {book.volumeInfo.authors && (
        <p>
          <strong>Författare:</strong>{" "}
          {book.volumeInfo.authors.join(", ")}
        </p>
      )}

      {book.volumeInfo.publishedDate && (
        <p>
          <strong>Publicerad:</strong>{" "}
          {book.volumeInfo.publishedDate}
        </p>
      )}

      {book.volumeInfo.publisher && (
        <p>
          <strong>Förlag:</strong>{" "}
          {book.volumeInfo.publisher}
        </p>
      )}

      {book.volumeInfo.imageLinks?.thumbnail && (
        <img
          src={book.volumeInfo.imageLinks.thumbnail}
          alt={book.volumeInfo.title}
          style={{ marginTop: "1rem" }}
        />
      )}

      {book.volumeInfo.description && (
        <div style={{ marginTop: "1rem" }}>
          <h3>Beskrivning</h3>
          <p>{book.volumeInfo.description}</p>
        </div>
      )}

       {/* =========================
           RECENSIONER
      ========================= */}

      <hr style={{ margin: "2rem 0" }} />

      <h2>Recensioner</h2>

      {loadingReviews && <p>Laddar recensioner...</p>}

      {reviews.length === 0 && (
        <p>Inga recensioner ännu.</p>
      )}

      {reviews.map((review) => (
        <div
          key={review.id}
          style={{
            border: "1px solid #ccc",
            padding: "1rem",
            marginBottom: "1rem",
          }}
        >
          <strong>{review.user?.email}</strong>
          <p>Betyg: {review.rating} ⭐</p>
          <p>{review.text}</p>
        </div>
      ))}

      {/* =========================
           SKRIV RECENSION
      ========================= */}

      {isAuthenticated && (
        <div style={{ marginTop: "2rem" }}>
          <h3>Skriv recension</h3>

          <textarea
            value={newReview}
            onChange={(e) =>
              setNewReview(e.target.value)
            }
            rows={4}
            style={{
              width: "100%",
              marginBottom: "1rem",
            }}
          />

          <div>
            <label>Betyg: </label>
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
          </div>

          <button
            onClick={handleCreateReview}
            style={{ marginTop: "1rem" }}
          >
            Skicka recension
          </button>
        </div>
      )}
    </div>
  );
} 
   
