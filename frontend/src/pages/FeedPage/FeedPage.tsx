import { useEffect, useState } from "react";
import { getFeed } from "../../api/feedApi";
import ReviewCard from "../../components/ReviewCard/ReviewCard";

export default function FeedPage() {

  const [feed, setFeed] = useState<any[]>([]);

  useEffect(() => {

    const loadFeed = async () => {

      const token = localStorage.getItem("token") || "";

      const data = await getFeed(token);

      setFeed(data);
    };

    loadFeed();

  }, []);

  return (

    <div>

      <h2>Aktivitetsflöde</h2>

      {feed.map((review) => (

        <ReviewCard
          key={review.id}
          review={review}
          isOwner={false}
          isAuthenticated={true}
          isLikeLoading={false}
          onDelete={() => {}}
          onUpdate={() => {}}
          onToggleLike={() => {}}
        />

      ))}

    </div>

  );
}