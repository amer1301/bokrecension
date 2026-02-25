import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Link, useLocation } from "react-router-dom";
import BookList from "../components/BookList";
import styles from "./Home.module.css";

/* =========================
   TYPER
========================= */

type GoogleBook = {
  id: string;
  volumeInfo: {
    title: string;
    authors?: string[];
  };
};

type ReadingStatus = {
  id: string;
  bookId: string;
  status: string;
  updatedAt: string;
};

type MyBook = {
  id: string;
  title: string;
  thumbnail?: string;
  status: string;
  updatedAt: string;
};

/* =========================
   KOMPONENT
========================= */

export default function HomePage() {
  const [query, setQuery] = useState("");
  const [books, setBooks] = useState<GoogleBook[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [myStatuses, setMyStatuses] = useState<ReadingStatus[]>([]);
  const [myBooks, setMyBooks] = useState<MyBook[]>([]);

  const { token, isAuthenticated } = useAuth();
  const location = useLocation();

  /* =========================
     HÄMTA ANVÄNDARENS STATUSAR
  ========================= */

  useEffect(() => {
    const fetchMyStatuses = async () => {
      if (!token) return;

      try {
        const response = await fetch(
          "http://localhost:3000/reading-status",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) return;

        const data = await response.json();

        // sortera senaste först
        const sorted = data.sort(
          (a: ReadingStatus, b: ReadingStatus) =>
            new Date(b.updatedAt).getTime() -
            new Date(a.updatedAt).getTime()
        );

        setMyStatuses(sorted);
      } catch (error) {
        console.error("Kunde inte hämta lässtatusar");
      }
    };

    fetchMyStatuses();
  }, [token, location.pathname]); // 👈 viktigt

  /* =========================
     HÄMTA BOKDETALJER
  ========================= */

  useEffect(() => {
    const fetchBooks = async () => {
      if (myStatuses.length === 0) {
        setMyBooks([]);
        return;
      }

      const apiKey = import.meta.env.VITE_GOOGLE_BOOKS_API_KEY;

      const booksWithDetails = await Promise.all(
        myStatuses.map(async (status) => {
          try {
            const response = await fetch(
              `https://www.googleapis.com/books/v1/volumes/${status.bookId}?key=${apiKey}`
            );

            if (!response.ok) {
              return null;
            }

            const data = await response.json();

            return {
              id: status.bookId,
              title: data.volumeInfo.title,
              thumbnail: data.volumeInfo.imageLinks?.thumbnail,
              status: status.status,
              updatedAt: status.updatedAt,
            };
          } catch {
            return null;
          }
        })
      );

      setMyBooks(
        booksWithDetails.filter(Boolean) as MyBook[]
      );
    };

    fetchBooks();
  }, [myStatuses]);

  /* =========================
     SÖK BÖCKER
  ========================= */

  const searchBooks = async () => {
    if (!query.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const apiKey = import.meta.env.VITE_GOOGLE_BOOKS_API_KEY;

      const url = new URL(
        "https://www.googleapis.com/books/v1/volumes"
      );
      url.searchParams.set("q", query);
      url.searchParams.set("maxResults", "10");
      url.searchParams.set("key", apiKey);

      const response = await fetch(url.toString());

      if (!response.ok) {
        throw new Error("Något gick fel vid API-anropet");
      }

      const data = await response.json();
      setBooks(data.items || []);
    } catch {
      setError("Kunde inte hämta böcker.");
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     ÖVERSÄTT
  ========================= */
  const translateStatus = (status: string) => {
  switch (status) {
    case "want_to_read":
      return "Vill läsa";
    case "reading":
      return "Läser";
    case "finished":
      return "Klar";
    default:
      return status;
  }
};
  /* =========================
     RENDER
  ========================= */

  return (
  <>
    {/* ================= HERO ================= */}
    <div className={styles.hero}>
      <h1>Bokrecensioner</h1>
      <p>Din personliga plats för att läsa, recensera och upptäcka böcker.</p>
    </div>

    {/* ================= MITT BIBLIOTEK ================= */}
    {isAuthenticated && (
      <>
        <h2 className={styles.sectionTitle}>📚 Mitt bibliotek</h2>
        <p className={styles.subText}>
          Dina senast uppdaterade böcker
        </p>
      </>
    )}

    {/* ================= MINA BÖCKER ================= */}
    {isAuthenticated && myBooks.length > 0 && (
      <div className={styles.bookList}>
        {myBooks.map((book) => (
          <div key={book.id} className={styles.bookItem}>
            {book.thumbnail && (
              <img
                src={book.thumbnail}
                alt={book.title}
                className={styles.thumbnail}
              />
            )}

            <div>
              <Link to={`/book/${book.id}`} className={styles.bookLink}>
                {book.title}
              </Link>
              <p className={styles.status}>
                Status: {translateStatus(book.status)}
              </p>
            </div>
          </div>
        ))}
      </div>
    )}

    {/* ================= SÖK ================= */}
    <div className={styles.searchWrapper}>
      <input
        type="text"
        placeholder="Sök efter bok..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <button onClick={searchBooks}>
        Sök
      </button>
    </div>

    {loading && <p className={styles.message}>Laddar...</p>}
    {error && <p className={styles.error}>{error}</p>}

    <BookList books={books} />
  </>
);
}