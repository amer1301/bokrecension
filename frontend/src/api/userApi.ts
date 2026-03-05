export async function updateUser(userId: string, data: any) {
  const res = await fetch(`http://localhost:3000/users/${userId}`, {
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
  const res = await fetch(`http://localhost:3000/users/${userId}`);

  if (!res.ok) {
    throw new Error("Failed to fetch user");
  }

  return res.json();
}