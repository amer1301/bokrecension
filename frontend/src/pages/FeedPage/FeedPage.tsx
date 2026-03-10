import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useQuery } from "@tanstack/react-query";

import { getFeed } from "../../api/feedApi";
import { likeReview, unlikeReview } from "../../api/likeApi";

import ReviewCard from "../../components/ReviewCard/ReviewCard";

export default function FeedPage() {

  const { token, isAuthenticated } = useAuth();

  const [loadingLike, setLoadingLike] = useState(false);

  /* ================= FETCH FEED ================= */

  const { data: feed = [], isLoading, isError } = useQuery({
    queryKey: ["feed", token],
    queryFn: () => getFeed(token!),
    enabled: !!token && isAuthenticated,
  });

  /* ================= TOGGLE LIKE ================= */

  const handleToggleLike = async (reviewId: string, isLiked: boolean) => {

    if (!token) return;

    try {

      setLoadingLike(true);

      if (isLiked) {
        await unlikeReview(token, reviewId);
      } else {
        await likeReview(token, reviewId);
      }

    } catch {

      console.error("Like failed");

    } finally {

      setLoadingLike(false);

    }

  };

  /* ================= LOADING ================= */

  if (isLoading) {
    return <p>Laddar feed...</p>;
  }

  if (isError) {
    return <p>Kunde inte hämta feed.</p>;
  }

  /* ================= UI ================= */

  return (

    <div>

      <h2>Aktivitetsflöde</h2>

      {feed.length === 0 && (
        <p>Inga recensioner ännu.</p>
      )}

      {feed.map((review: any) => (

        <ReviewCard
          key={review.id}
          review={review}
          isOwner={false}
          isAuthenticated={isAuthenticated}
          isLikeLoading={loadingLike}
          onDelete={() => {}}
          onUpdate={() => {}}
          onToggleLike={handleToggleLike}
        />

      ))}

    </div>

  );

}