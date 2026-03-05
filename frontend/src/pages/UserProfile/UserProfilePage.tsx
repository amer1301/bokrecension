import { useParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import styles from "./UserProfile.module.css";

import {
  followUser,
  unfollowUser,
  getFollowStatus,
} from "../../api/followApi";

type ProfileStats = {
  totalReviews: number;
  avgRating: number;
  totalLikes: number;
};

type User = {
  id: string;
  username: string | null;
  avatarUrl: string | null;
};

export default function UserProfilePage() {
  const { id = "" } = useParams();
  const { token } = useAuth();

  const [isFollowing, setIsFollowing] = useState(false);

  if (!token) {
    return <p>Du måste vara inloggad</p>;
  }

  if (!id) {
    return <p>Användare saknas</p>;
  }

  const myUserId = JSON.parse(
    atob(token.split(".")[1])
  ).userId;

  /* =========================
     HÄMTA USER DATA
  ========================= */

  const { data: user, isLoading: userLoading } = useQuery<User>({
    queryKey: ["user", id],
    queryFn: async () => {
      const res = await fetch(
        `http://localhost:3000/users/${id}`
      );

      if (!res.ok) {
        throw new Error("Kunde inte hämta användare");
      }

      return res.json();
    },
  });

  /* =========================
     HÄMTA STATS
  ========================= */

  const { data, isLoading } = useQuery<ProfileStats>({
    queryKey: ["userStats", id],
    queryFn: async () => {
      const res = await fetch(
        `http://localhost:3000/users/${id}/stats`
      );

      if (!res.ok) {
        throw new Error("Kunde inte hämta statistik");
      }

      return res.json();
    },
  });

  /* =========================
     CHECK FOLLOW STATUS
  ========================= */

  useEffect(() => {
    async function checkFollow() {
      try {
        const data = await getFollowStatus(id, myUserId);
        setIsFollowing(data.isFollowing);
      } catch {
        console.error("Could not fetch follow status");
      }
    }

    checkFollow();
  }, [id, myUserId]);

  /* =========================
     FOLLOW / UNFOLLOW
  ========================= */

  const handleFollow = async () => {
    try {
      if (isFollowing) {
        await unfollowUser(id, myUserId);
        toast("Du slutade följa användaren");
      } else {
        await followUser(id, myUserId);
        toast.success("Du följer nu användaren");
      }

      setIsFollowing(!isFollowing);
    } catch {
      toast.error("Något gick fel");
    }
  };

  /* =========================
     LOADING
  ========================= */

  if (isLoading || userLoading) {
    return <p>Laddar...</p>;
  }

  if (!data) {
    return <p>Ingen data</p>;
  }

  /* =========================
     UI
  ========================= */

  return (
    <div className={styles.container}>
      <div className={styles.header}>
      <h1>Användarprofil</h1>
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
          <p>Likes</p>
        </div>

      </div>

      {/* Follow button */}
      {id !== myUserId && (
        <div className={styles.followWrapper}>
          <button
            className="outlineButton"
            onClick={handleFollow}
          >
            {isFollowing
              ? "Avfölj användare"
              : "Följ användare"}
          </button>
        </div>
      )}

    </div>
  );
}