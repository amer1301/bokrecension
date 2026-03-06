const API_URL = import.meta.env.VITE_API_URL;

export async function followUser(userId: string, followerId: string) {
  await fetch(`${API_URL}/users/${userId}/follow`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ followerId }),
  });
}

export async function unfollowUser(userId: string, followerId: string) {
  await fetch(`${API_URL}/users/${userId}/follow`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ followerId }),
  });
}

export async function getFollowStatus(userId: string, followerId: string) {
const res = await fetch(
  `${API_URL}/users/${userId}/follow-status/${followerId}`
);

  return res.json();
}