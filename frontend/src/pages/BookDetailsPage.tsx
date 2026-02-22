import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

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

export default function BookDetailsPage() {
    const { id } = useParams<{ id: string }>();
    const [book, setBook] = useState<GoogleBookDetails | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchBook = async () => {
            if (!id) return;

            setLoading(true);
            setError(null);

            try {
                const apiKey = import.meta.env.VITE_GOOGLE_BOOKS_API_KEY;

                const response = await fetch(
                    `https://googleapis.com/books/v1/volumes/${id}?key=${apiKey}`
                );

                if(!response.ok) {
                    throw new Error("Kunde inte hämta bokdetaljer.");
                }

                const data = await response.json();
                setBook(data);
            } catch (err) {
                setError("Ett fel uppstod.");
            } finally {
                setLoading(false);
            }
        };

        fetchBook();
    }, [id]);

    if (loading) return <p>Laddar bok...</p>;
    if (error) return <p style={{ color: "red" }}>{error}</p>
    if (!book) return <p>Ingen bok hittades.</p>;

    return (
        <div style ={{ padding: "2rem" }}>
            <h1>{book.volumeInfo.title}</h1>

            {book.volumeInfo.authors && (
                <p><strong>Författare:</strong> {book.volumeInfo.authors.join(", ")}</p>
            )}

            {book.volumeInfo.publishedDate && (
                <p><strong>Publicerad:</strong> {book.volumeInfo.publishedDate}</p>
            )}

            {book.volumeInfo.publisher && (
                <p><strong>Förlag:</strong> {book.volumeInfo.publisher}</p>
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
        </div>
    );
}