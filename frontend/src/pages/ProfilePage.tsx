import { useAuth } from "../context/AuthContext";
import { useQuery } from "@tanstack/react-query";

type ProfileStats = {
  totalReviews: number;
  avgRating: number;
  totalLikes: number;
};

export default function ProfilePage() {
  const { token } = useAuth();

  if (!token) return <p>Du måste vara inloggad.</p>;

  const userId = JSON.parse(
    atob(token.split(".")[1])
  ).userId;

  const { data, isLoading } = useQuery<ProfileStats>({
    queryKey: ["profileStats"],
    queryFn: async () => {
      const res = await fetch(
        `http://localhost:3000/users/${userId}/stats`
      );
      if (!res.ok)
        throw new Error("Kunde inte hämta statistik");
      return res.json();
    },
  });

  if (isLoading) return <p>Laddar...</p>;
  if (!data) return <p>Ingen data hittades.</p>;

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Min profil</h1>

      <p>Antal recensioner: {data.totalReviews}</p>

      <p>
        Genomsnittsbetyg:{" "}
        {data.avgRating.toFixed(1)}
      </p>

      <p>Totala likes: {data.totalLikes}</p>
    </div>
  );
}