const API_URL = import.meta.env.VITE_API_URL;

export async function updateUser(userId: string, data: any) {
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

export async function getUser(userId: string) {
  const res = await fetch(`${API_URL}/users/${userId}`);

  if (!res.ok) {
    throw new Error("Failed to fetch user");
  }

  return res.json();
}