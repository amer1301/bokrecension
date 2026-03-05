import { useAuth } from "../../context/AuthContext";
import { useQuery } from "@tanstack/react-query";
import styles from "./Profile.module.css";
import { Link } from "react-router-dom";

type User = {
  id: string;
  username: string | null;
  avatarUrl: string | null;
};

type ProfileStats = {
  totalReviews: number;
  avgRating: number;
  totalLikes: number;
};

type FollowUser = {
  id: string;
  username: string | null;
  avatarUrl: string | null;
};

type FollowData = {
  followers: FollowUser[];
  following: FollowUser[];
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

  const decoded = JSON.parse(atob(token.split(".")[1]));
  const userId = decoded.userId;

  /* ========================
     HÄMTA USER
  ======================== */

  const { data: user } = useQuery<User>({
    queryKey: ["user", userId],
    queryFn: async () => {
      const res = await fetch(
        `http://localhost:3000/users/${userId}`
      );

      if (!res.ok) {
        throw new Error("Kunde inte hämta användare");
      }

      return res.json();
    },
  });

  /* ========================
     HÄMTA STATS
  ======================== */

  const { data, isLoading, isError } = useQuery<ProfileStats>({
    queryKey: ["profileStats", userId],
    queryFn: async () => {
      const res = await fetch(
        `http://localhost:3000/users/${userId}/stats`
      );

      if (!res.ok) {
        throw new Error("Kunde inte hämta statistik");
      }

      return res.json();
    },
  });

  const { data: follows } = useQuery<FollowData>({
  queryKey: ["follows", userId],
  queryFn: async () => {
    const res = await fetch(
      `http://localhost:3000/users/${userId}/follows`
    );
    return res.json();
  },
});

  /* ========================
     LOADING
  ======================== */

  if (isLoading) {
    return (
      <div className={styles.centerMessage}>
        <p>Laddar...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className={styles.centerMessage}>
        <p>Något gick fel.</p>
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

  /* ========================
     UI
  ======================== */

  return (
    <div className={styles.container}>
      
      <div className={styles.header}>
        <h1>Min profil</h1>
      </div>

      {/* Avatar */}
      <img
        src={user?.avatarUrl ?? "/default-avatar.png"}
        alt="Profilbild"
        className={styles.avatar}
      />

      {/* Username */}
      <h2 className={styles.username}>
        {user?.username ?? "Användare"}
      </h2>

      {/* Stats */}
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
<div className={styles.followSection}>

<h3>Följer ({follows?.following.length ?? 0})</h3>

<div className={styles.followList}>
  {follows?.following.map((user) => (
    <div key={user.id} className={styles.followUser}>
      <img
        src={user.avatarUrl ?? "/default-avatar.png"}
        className={styles.followAvatar}
      />
      <p>{user.username ?? "Användare"}</p>
    </div>
  ))}
</div>


<h3>Följare ({follows?.followers.length ?? 0})</h3>

<div className={styles.followList}>
  {follows?.followers.map((user) => (
    <div key={user.id} className={styles.followUser}>
      <img
        src={user.avatarUrl ?? "/default-avatar.png"}
        className={styles.followAvatar}
      />
      <p>{user.username ?? "Användare"}</p>
    </div>
  ))}
</div>

</div>
      </div>
      {/* Edit profile */}
      <div className={styles.editWrapper}>
  <Link to="/edit-profile">
    <button className="outlineButton">
      Redigera profil
    </button>
  </Link>
</div>
    </div>
  );
}