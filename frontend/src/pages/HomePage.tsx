import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
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

  const { token, isAuthenticated } = useAuth();

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
        setMyStatuses(data);
      } catch (error) {
        console.error("Kunde inte hämta lässtatusar");
      }
    };

    fetchMyStatuses();
  }, [token]);

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
     RENDER
  ========================= */

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Bokrecensioner</h1>

      {/* =========================
         MINA BÖCKER
      ========================= */}

      {isAuthenticated && myStatuses.length > 0 && (
        <div style={{ marginBottom: "2rem" }}>
          <h2>Mina böcker</h2>

          {/* Läser */}
          {myStatuses
            .filter((s) => s.status === "reading")
            .map((s) => (
              <p key={s.id}>📖 Läser: {s.bookId}</p>
            ))}

          {/* Klar */}
          {myStatuses
            .filter((s) => s.status === "finished")
            .map((s) => (
              <p key={s.id}>✅ Klar: {s.bookId}</p>
            ))}

          {/* Vill läsa */}
          {myStatuses
            .filter((s) => s.status === "want_to_read")
            .map((s) => (
              <p key={s.id}>📚 Vill läsa: {s.bookId}</p>
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
      {error && <p style={{ color: "red" }}>{error}</p>}

      <BookList books={books} />
    </div>
  );
}