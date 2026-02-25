import { useAuth } from "../context/AuthContext";
import { useQuery } from "@tanstack/react-query";
import styles from "./Profile.module.css";

type ProfileStats = {
  totalReviews: number;
  avgRating: number;
  totalLikes: number;
};

export default function ProfilePage() {
  const { token } = useAuth();

  if (!token) {
    return (
      <div className={styles.centerMessage}>
        <p>Du måste vara inloggad.</p>
      </div>
    );
  }

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

  if (isLoading) {
    return (
      <div className={styles.centerMessage}>
        <p>Laddar...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className={styles.centerMessage}>
        <p>Ingen data hittades.</p>
      </div>
    );
  }

  return (
    <div>
      <div className={styles.header}>
        <h1>Min profil</h1>
      </div>

      <div className={styles.stats}>
        <div className={styles.statCard}>
          <h2>{data.totalReviews}</h2>
          <p>Recensioner</p>
        </div>

        <div className={styles.statCard}>
          <h2>{data.avgRating.toFixed(1)}</h2>
          <p>Snittbetyg</p>
        </div>

        <div className={styles.statCard}>
          <h2>{data.totalLikes}</h2>
          <p>Totala likes</p>
        </div>
      </div>
    </div>
  );
}