export async function getBookDetails(id: string) {
  const apiKey = import.meta.env.VITE_GOOGLE_BOOKS_API_KEY;

  const response = await fetch(
    `https://www.googleapis.com/books/v1/volumes/${id}?key=${apiKey}`
  );

  if (!response.ok)
    throw new Error("Kunde inte hämta bokdetaljer");

  return response.json();
}