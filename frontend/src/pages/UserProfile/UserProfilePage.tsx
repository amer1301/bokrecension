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

export default function UserProfilePage() {

  const { id } = useParams();
  const { token } = useAuth();

  const [isFollowing, setIsFollowing] = useState(false);

  if (!token) return <p>Du måste vara inloggad</p>;

  const myUserId = JSON.parse(
    atob(token.split(".")[1])
  ).userId;

  const { data, isLoading } = useQuery<ProfileStats>({
    queryKey: ["userStats", id],
    queryFn: async () => {

      const res = await fetch(
        `http://localhost:3000/users/${id}/stats`
      );

      return res.json();

    },
  });

  useEffect(() => {

    async function checkFollow() {

      if (!id) return;

      const data = await getFollowStatus(id, myUserId);

      setIsFollowing(data.isFollowing);

    }

    checkFollow();

  }, [id]);

  const handleFollow = async () => {

    if (!id) return;

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

  if (isLoading) return <p>Laddar...</p>;

  if (!data) return <p>Ingen data</p>;

  return (

    <div className={styles.container}>

      <h1>Användarprofil</h1>

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

{id !== myUserId && (
  <div className={styles.followWrapper}>
    <button
      className="outlineButton"
      onClick={handleFollow}
    >
      {isFollowing ? "Avfölj användare" : "Följ användare"}
    </button>
  </div>
)}

</div>
);
}