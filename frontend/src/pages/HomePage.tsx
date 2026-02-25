import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Link, useLocation } from "react-router-dom";
import BookList from "../components/BookList";

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
    <div style={{ padding: "2rem" }}>
      <h1>Bokrecensioner</h1>

      {isAuthenticated && (
        <>
          <h2>📚 Mitt bibliotek</h2>
          <p style={{ color: "#666" }}>
            Dina senast uppdaterade böcker
          </p>
        </>
      )}

      {/* =========================
         MINA BÖCKER
      ========================= */}

      {isAuthenticated && myBooks.length > 0 && (
        <div style={{ marginBottom: "2rem" }}>
          <h2>Mina böcker</h2>

          {myBooks.map((book) => (
            <div
              key={book.id}
              style={{
                display: "flex",
                alignItems: "center",
                marginBottom: "1rem",
              }}
            >
              {book.thumbnail && (
                <img
                  src={book.thumbnail}
                  alt={book.title}
                  style={{
                    width: "50px",
                    marginRight: "1rem",
                  }}
                />
              )}

              <div>
                <Link to={`/book/${book.id}`}>
                  <strong>{book.title}</strong>
                </Link>
                <p style={{ margin: 0 }}>
                  Status: {translateStatus(book.status)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* =========================
         SÖK
      ========================= */}

      <div style={{ marginBottom: "1rem" }}>
        <input
          type="text"
          placeholder="Sök efter bok..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{ padding: "0.5rem", width: "300px" }}
        />
        <button
          onClick={searchBooks}
          style={{ marginLeft: "0.5rem" }}
        >
          Sök
        </button>
      </div>

      {loading && <p>Laddar...</p>}
      {error && (
        <p style={{ color: "red" }}>{error}</p>
      )}

      <BookList books={books} />
    </div>
  );
}