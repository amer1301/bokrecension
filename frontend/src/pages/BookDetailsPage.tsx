import { useState } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import RatingSummary from "../components/RatingSummary";
import ReviewCard from "../components/ReviewCard";
import ReadingStatusSection from "../components/ReadingStatusSection";

import { getBookDetails } from "../api/bookApi";
import {
  getReviews,
  createReview,
  updateReview,
  deleteReview,
  likeReview,
  unlikeReview,
} from "../api/reviewApi";
import {
  getReadingStatus,
  updateReadingStatus,
} from "../api/readingStatusApi";

type Review = {
  id: string;
  text: string;
  rating: number;
  createdAt: string;
  likesCount: number;
  isLikedByUser: boolean;
  user?: {
    email: string;
    id: string;
  };
};

export default function BookDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const { token, isAuthenticated, userId } = useAuth();
  const queryClient = useQueryClient();

  const [newReview, setNewReview] = useState("");
  const [rating, setRating] = useState(5);

  /* =========================
     HÄMTA BOK
  ========================= */

  const {
    data: book,
    isLoading: loadingBook,
  } = useQuery({
    queryKey: ["book", id],
    queryFn: () => getBookDetails(id!),
    enabled: !!id,
  });

  /* =========================
     HÄMTA RECENSIONER
  ========================= */

  const { data: reviews = [] } =
    useQuery<Review[]>({
      queryKey: ["reviews", id],
      queryFn: () => getReviews(id!),
      enabled: !!id,
    });

  /* =========================
     MUTATIONS
  ========================= */

  const createReviewMutation = useMutation({
    mutationFn: (data: {
      bookId: string;
      text: string;
      rating: number;
    }) => createReview(token!, data),
    onSettled: () =>
      queryClient.invalidateQueries({
        queryKey: ["reviews", id],
      }),
  });

  const updateReviewMutation = useMutation({
    mutationFn: (data: {
      reviewId: string;
      text: string;
      rating: number;
    }) =>
      updateReview(token!, data.reviewId, {
        text: data.text,
        rating: data.rating,
      }),
    onSettled: () =>
      queryClient.invalidateQueries({
        queryKey: ["reviews", id],
      }),
  });

  const deleteReviewMutation = useMutation({
    mutationFn: (reviewId: string) =>
      deleteReview(token!, reviewId),
    onSettled: () =>
      queryClient.invalidateQueries({
        queryKey: ["reviews", id],
      }),
  });

  const toggleLikeMutation = useMutation({
    mutationFn: ({
      reviewId,
      isLiked,
    }: {
      reviewId: string;
      isLiked: boolean;
    }) =>
      isLiked
        ? unlikeReview(token!, reviewId)
        : likeReview(token!, reviewId),
    onSettled: () =>
      queryClient.invalidateQueries({
        queryKey: ["reviews", id],
      }),
  });

  const handleCreateReview = () => {
    if (!newReview.trim()) return;

    createReviewMutation.mutate({
      bookId: id!,
      text: newReview,
      rating,
    });

    setNewReview("");
    setRating(5);
  };

  /* =========================
     RENDER
  ========================= */

  if (loadingBook) return <p>Laddar bok...</p>;
  if (!book) return <p>Ingen bok hittades.</p>;

  return (
    <div style={{ padding: "2rem" }}>
      <h1>{book.volumeInfo.title}</h1>

      <hr />

      {/* =========================
         LÄSSTATUS (NY KOMPONENT)
      ========================= */}

      {isAuthenticated && token && (
        <ReadingStatusSection
          bookId={id!}
          token={token}
          pageCount={book.volumeInfo.pageCount}
          getReadingStatus={getReadingStatus}
          updateReadingStatus={updateReadingStatus}
        />
      )}

      {/* =========================
         RECENSIONER
      ========================= */}

      <h2>Recensioner</h2>

      <RatingSummary reviews={reviews} />

{reviews.map((review) => (
  <ReviewCard
    key={review.id}
    review={review}
    isOwner={review.user?.id === userId}
    isAuthenticated={isAuthenticated}
    onDelete={(id) =>
      deleteReviewMutation.mutate(id)
    }
    onUpdate={(id, text, rating) =>
      updateReviewMutation.mutate({
        reviewId: id,
        text,
        rating,
      })
    }
    onToggleLike={(id, isLiked) =>
      toggleLikeMutation.mutate({
        reviewId: id,
        isLiked,
      })
    }
  />
))}

      {/* =========================
         SKRIV RECENSION
      ========================= */}

      {isAuthenticated && (
        <div style={{ marginTop: "2rem" }}>
          <h3>Skriv recension</h3>

          <textarea
            value={newReview}
            onChange={(e) =>
              setNewReview(e.target.value)
            }
          />

          <select
            value={rating}
            onChange={(e) =>
              setRating(Number(e.target.value))
            }
          >
            {[1, 2, 3, 4, 5].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>

          <button onClick={handleCreateReview}>
            Skicka recension
          </button>
        </div>
      )}
    </div>
  );
}