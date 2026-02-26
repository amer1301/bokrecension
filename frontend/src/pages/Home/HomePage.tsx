import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import BookList from "../../components/BookList";
import styles from "./Home.module.css";
import { getUserLibrary } from "../../api/readingStatusApi";

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

export default function HomePage() {
  const { token, isAuthenticated } = useAuth();

  const [query, setQuery] = useState("");
  const [books, setBooks] = useState<GoogleBook[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [myBooks, setMyBooks] = useState<MyBook[]>([]);

  const { data: myStatuses } = useQuery<ReadingStatus[]>({
    queryKey: ["library"],
    queryFn: () => getUserLibrary(token!),
    enabled: isAuthenticated && !!token,
  });

  useEffect(() => {
    if (!myStatuses || myStatuses.length === 0) {
      setMyBooks([]);
      return;
    }

    const fetchBooks = async () => {
      const apiKey = import.meta.env.VITE_GOOGLE_BOOKS_API_KEY;

      const booksWithDetails = await Promise.all(
        myStatuses.map(async (status) => {
          try {
            const response = await fetch(
              `https://www.googleapis.com/books/v1/volumes/${status.bookId}?key=${apiKey}`
            );

            if (!response.ok) return null;

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

      if (!response.ok) throw new Error();

      const data = await response.json();
      setBooks(data.items || []);
    } catch {
      setError("Kunde inte hämta böcker.");
    } finally {
      setLoading(false);
    }
  };

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

  return (
    <>
      <div className={styles.hero}>
        <h1>Bokrecensioner</h1>
        <p>Din personliga plats för att läsa, recensera och upptäcka böcker.</p>
      </div>

      {isAuthenticated && (
        <>
          <h2 className={styles.sectionTitle}>Mitt bibliotek</h2>
          <p className={styles.subText}>Dina senast uppdaterade böcker</p>

          {myBooks.length === 0 ? (
            <p className={styles.message}>Inga böcker tillagda ännu.</p>
          ) : (
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
                    <Link
                      to={`/book/${book.id}`}
                      className={styles.bookLink}
                    >
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
        </>
      )}

      <div className={styles.searchWrapper}>
        <input
          type="text"
          placeholder="Sök efter bok..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button onClick={searchBooks}>Sök</button>
      </div>

      {loading && <p className={styles.message}>Laddar...</p>}
      {error && <p className={styles.error}>{error}</p>}

      <BookList books={books} />
    </>
  );
}