const API_URL = import.meta.env.VITE_API_URL;

type UpdateUserData = {
  username?: string;
  avatarUrl?: string;
};

/* =========================
   HÄMTA EN ANVÄNDARE
========================= */

export async function getUser(userId: string) {
  const res = await fetch(`${API_URL}/users/${userId}`);

  if (!res.ok) {
    throw new Error("Failed to fetch user");
  }

  return res.json();
}

/* =========================
   UPPDATERA ANVÄNDARE
========================= */

export async function updateUser(userId: string, data: UpdateUserData) {
  const res = await fetch(`${API_URL}/users/${userId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    throw new Error("Failed to update user");
  }

  return res.json();
}

/* =========================
   HÄMTA USER STATS
========================= */

export async function getUserStats(userId: string) {
  const res = await fetch(`${API_URL}/users/${userId}/stats`);

  if (!res.ok) {
    throw new Error("Kunde inte hämta statistik");
  }

  return res.json();
}

/* =========================
   HÄMTA FOLLOWERS / FOLLOWING
========================= */

export async function getFollows(userId: string) {
  const res = await fetch(`${API_URL}/users/${userId}/follows`);

  if (!res.ok) {
    throw new Error("Kunde inte hämta follows");
  }

  return res.json();
}