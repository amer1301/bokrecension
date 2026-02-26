const API_URL = "http://localhost:3000";

export async function getReadingStatus(
  token: string,
  bookId: string
) {
  const response = await fetch(
    `${API_URL}/reading-status/${bookId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) return null;
  return response.json();
}

export async function getUserLibrary(token: string) {
  const response = await fetch(
    "http://localhost:3000/reading-status",
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Kunde inte hämta bibliotek");
  }

  return response.json();
}

export async function updateReadingStatus(
  token: string,
  data: {
    bookId: string;
    status: string;
    pagesRead: number;
  }
) {
  const response = await fetch(
    `${API_URL}/reading-status`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    }
  );

  if (!response.ok)
    throw new Error("Kunde inte uppdatera status");

  return response.json();
}