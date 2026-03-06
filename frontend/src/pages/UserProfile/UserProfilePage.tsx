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

import {
  getUser,
  getUserStats,
} from "../../api/userApi";

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

  const myUserId = JSON.parse(atob(token.split(".")[1])).userId;

  /* =========================
     USER DATA
  ========================= */

  const { data: user, isLoading: userLoading } =
    useQuery<User>({
      queryKey: ["user", id],
      queryFn: () => getUser(id),
    });

  /* =========================
     STATS
  ========================= */

  const { data: stats, isLoading: statsLoading } =
    useQuery<ProfileStats>({
      queryKey: ["userStats", id],
      queryFn: () => getUserStats(id),
    });

  /* =========================
     FOLLOW STATUS
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

  if (userLoading || statsLoading) {
    return <p>Laddar...</p>;
  }

  if (!stats) {
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

      <img
        src={user?.avatarUrl ?? "/default-avatar.png"}
        alt="Profilbild"
        className={styles.avatar}
      />

      <h2 className={styles.username}>
        {user?.username ?? "Användare"}
      </h2>

      <div className={styles.stats}>
        <div className={styles.statCard}>
          <h2>{stats.totalReviews}</h2>
          <p>Recensioner</p>
        </div>

        <div className={styles.statCard}>
          <h2>{stats.avgRating.toFixed(1)}</h2>
          <p>Snittbetyg</p>
        </div>

        <div className={styles.statCard}>
          <h2>{stats.totalLikes}</h2>
          <p>Likes</p>
        </div>
      </div>

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