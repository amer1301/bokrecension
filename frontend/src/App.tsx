import { useState } from "react";

type GoogleBooksResponse = {
  totalItems: number;
  items?: Array<{
    id: string;
    volumeInfo: {
      title: string;
      authors?: string[];
    };
  }>;
};

export default function App() {
  const [query, setQuery] = useState("harry potter");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<GoogleBooksResponse["items"]>([]);

  const search = async () => {
    setLoading(true);
    setError(null);

    try {
      const apiKey = import.meta.env.VITE_GOOGLE_BOOKS_API_KEY as string | undefined;

      if (!apiKey) {
        throw new Error("Saknar VITE_GOOGLE_BOOKS_API_KEY i .env");
      }

      const url = new URL("https://www.googleapis.com/books/v1/volumes");
      url.searchParams.set("q", query);
      url.searchParams.set("maxResults", "10");
      url.searchParams.set("key", apiKey);

      const res = await fetch(url.toString());

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Google Books API error: ${res.status} ${res.statusText}\n${text}`);
      }

      const data: GoogleBooksResponse = await res.json();
      setResults(data.items ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Okänt fel");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 16, fontFamily: "system-ui" }}>
      <h1>Google Books API test</h1>

      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Sök böcker…"
          style={{ padding: 8, width: 320 }}
        />
        <button onClick={search} disabled={loading} style={{ padding: "8px 12px" }}>
          {loading ? "Söker…" : "Sök"}
        </button>
      </div>

      {error && (
        <pre style={{ background: "#fee", padding: 12, whiteSpace: "pre-wrap" }}>
          {error}
        </pre>
      )}

      <ul>
        {results?.map((b) => (
          <li key={b.id}>
            <strong>{b.volumeInfo.title}</strong>
            {b.volumeInfo.authors?.length ? ` — ${b.volumeInfo.authors.join(", ")}` : ""}
          </li>
        ))}
      </ul>
    </div>
  );
}