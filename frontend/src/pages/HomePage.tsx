import { useState } from "react";
import BookList from "../components/BookList";

type GoogleBook = {
    id: string,
    volumeInfo: {
        title: string,
        authors?: string[];
    };
};

export default function HomePage() {
    const [query, setQuery] = useState("");
    const [books, setBooks] = useState<GoogleBook[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const searchBooks = async () => {
        if (!query.trim()) return;

        setLoading(true);
        setError(null);

        try {
            const apiKey = import.meta.env.VITE_GOOGLE_BOOKS_API_KEY;

            const url = new URL("https://www.googleapis.com/books/v1/volumes");
            url.searchParams.set("q", query);
            url.searchParams.set("maxResults", "10");
            url.searchParams.set("key", apiKey);

            const response = await fetch(url.toString());

            if (!response.ok) {
                throw new Error("Något gick fel vid API-anropet");
            }

            const data = await response.json();
            setBooks(data.items || []);
        } catch (err) {
            setError("Kunde inte hämta böcker.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: "2rem" }}>
            <h1>Bokrecensioner</h1>

            <div style={{ marginBottom: "1rem" }}>
                <input
                type="text"
                placeholder="Sök efter bok..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                style={{ padding: "0.5rem", width: "300px" }}
                />
                <button onClick={searchBooks} style={{ marginLeft: "0.5rem" }}>
                    Sök
                </button>
            </div>

            {loading && <p>Laddar...</p>}
            {error && <p style={{ color: "red" }}>{error}</p>}

            <BookList books={books} />
        </div>
    );
}