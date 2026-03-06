const API_URL = import.meta.env.VITE_API_URL;

export async function getUser(userId: string) {
  const res = await fetch(`${API_URL}/users/${userId}`);

  if (!res.ok) {
    throw new Error("Kunde inte hämta användare");
  }

  return res.json();
}

export async function getProfileStats(userId: string) {
  const res = await fetch(`${API_URL}/users/${userId}/stats`);

  if (!res.ok) {
    throw new Error("Kunde inte hämta statistik");
  }

  return res.json();
}

export async function getFollows(userId: string) {
  const res = await fetch(`${API_URL}/users/${userId}/follows`);

  if (!res.ok) {
    throw new Error("Kunde inte hämta follows");
  }

  return res.json();
}