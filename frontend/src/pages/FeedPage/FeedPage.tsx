import { useEffect, useState } from "react";
import { getFeed } from "../../api/feedApi";
import ReviewCard from "../../components/ReviewCard/ReviewCard";
import { likeReview, unlikeReview } from "../../api/likeApi";

export default function FeedPage() {

  const [feed, setFeed] = useState<any[]>([]);
  const [loadingLike, setLoadingLike] = useState(false);

  useEffect(() => {

    const loadFeed = async () => {

      const token = localStorage.getItem("token") || "";

      const data = await getFeed(token);

      setFeed(data);

    };

    loadFeed();

  }, []);

  const handleToggleLike = async (reviewId: string, isLiked: boolean) => {

    try {

      setLoadingLike(true);

      const token = localStorage.getItem("token") || "";

      if (isLiked) {
        await unlikeReview(token, reviewId);
      } else {
        await likeReview(token, reviewId);
      }

      setFeed((prev) =>
        prev.map((review) =>
          review.id === reviewId
            ? {
                ...review,
                isLikedByUser: !isLiked,
                likesCount: isLiked
                  ? review.likesCount - 1
                  : review.likesCount + 1,
              }
            : review
        )
      );

    } catch (err) {

      console.error("Like failed");

    } finally {

      setLoadingLike(false);

    }

  };

  return (

    <div>

      <h2>Aktivitetsflöde</h2>

      {feed.map((review) => (

        <ReviewCard
          key={review.id}
          review={review}
          isOwner={false}
          isAuthenticated={true}
          isLikeLoading={loadingLike}
          onDelete={() => {}}
          onUpdate={() => {}}
          onToggleLike={handleToggleLike}
        />

      ))}

    </div>

  );

}