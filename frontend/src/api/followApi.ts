export async function followUser(userId: string, followerId: string) {
  await fetch(`http://localhost:3000/users/${userId}/follow`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ followerId }),
  });
}

export async function unfollowUser(userId: string, followerId: string) {
  await fetch(`http://localhost:3000/users/${userId}/follow`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ followerId }),
  });
}

export async function getFollowStatus(userId: string, followerId: string) {
  const res = await fetch(
    `http://localhost:3000/users/${userId}/follow-status/${followerId}`
  );

  return res.json();
}