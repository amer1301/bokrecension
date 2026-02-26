import { useState } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import styles from "./BookDetails.module.css";
import RatingSummary from "../../components/RatingSummary/RatingSummary";
import ReviewCard from "../../components/ReviewCard/ReviewCard";
import ReadingStatusSection from "../../components/ReadingStatus/ReadingStatusSection";

import { getBookDetails } from "../../api/bookApi";
import {
  getReviews,
  createReview,
  updateReview,
  deleteReview,
  likeReview,
  unlikeReview,
} from "../../api/reviewApi";

import type { PaginatedReviews } from "../../api/reviewApi";

import {
  getReadingStatus,
  updateReadingStatus,
} from "../../api/readingStatusApi";

export default function BookDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const { token, isAuthenticated, userId } = useAuth();
  const queryClient = useQueryClient();

  const [newReview, setNewReview] = useState("");
  const [rating, setRating] = useState(5);
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<"asc" | "desc">("desc");

  const {
    data: book,
    isLoading: loadingBook,
  } = useQuery({
    queryKey: ["book", id],
    queryFn: () => getBookDetails(id!),
    enabled: !!id,
  });

  const {
    data: reviewData,
    isLoading: loadingReviews,
  } = useQuery<PaginatedReviews>({
    queryKey: ["reviews", id, page, sort],
    queryFn: () => getReviews(id!, page, 5, sort),
    enabled: !!id,
  });

  const reviews = reviewData?.reviews ?? [];
  const totalPages = reviewData?.pagination.totalPages ?? 1;

  const createReviewMutation = useMutation({
    mutationFn: (data: {
      bookId: string;
      text: string;
      rating: number;
    }) => createReview(token!, data),
    onSuccess: () => {
      setPage(1);
      queryClient.invalidateQueries({
        queryKey: ["reviews", id, page, sort],
      });
    },
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
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: ["reviews", id, page, sort],
      }),
  });

  const deleteReviewMutation = useMutation({
    mutationFn: (reviewId: string) =>
      deleteReview(token!, reviewId),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: ["reviews", id, page, sort],
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

  onMutate: async ({ reviewId, isLiked }) => {
    await queryClient.cancelQueries({
      queryKey: ["reviews", id, page, sort],
    });

    const previousData =
      queryClient.getQueryData<PaginatedReviews>([
        "reviews",
        id,
        page,
        sort,
      ]);

    if (!previousData) return;

    queryClient.setQueryData<PaginatedReviews>(
      ["reviews", id, page, sort],
      {
        ...previousData,
        reviews: previousData.reviews.map((review) =>
          review.id === reviewId
            ? {
                ...review,
                isLikedByUser: !isLiked,
                likesCount: isLiked
                  ? review.likesCount - 1
                  : review.likesCount + 1,
              }
            : review
        ),
      }
    );

    return { previousData };
  },

  onError: (_err, _vars, context) => {
    if (context?.previousData) {
      queryClient.setQueryData(
        ["reviews", id, page, sort],
        context.previousData
      );
    }
  },

  onSettled: () => {
    queryClient.invalidateQueries({
      queryKey: ["reviews", id],
    });
  },
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

  if (loadingBook) return <p>Laddar bok...</p>;
  if (!book) return <p>Ingen bok hittades.</p>;

return (
  <div className={styles.appContainer}>
    {/* ================= BOOK HEADER ================= */}
    <header className={styles.bookHeader}>
      <h1 className={styles.title}>
        {book.volumeInfo.title}
      </h1>
      <hr className={styles.divider} />
    </header>

    {/* ================= READING STATUS ================= */}
    {isAuthenticated && token && (
      <ReadingStatusSection
        bookId={id!}
        token={token}
        pageCount={book.volumeInfo.pageCount}
        getReadingStatus={getReadingStatus}
        updateReadingStatus={updateReadingStatus}
      />
    )}

    {/* ================= REVIEWS ================= */}
    <section className={styles.section}>
      <div className={styles.reviewsHeader}>
        <h2>Recensioner</h2>

        <div className={styles.sortWrapper}>
          <label htmlFor="sort">Sortera:</label>
          <select
            id="sort"
            value={sort}
            onChange={(e) => {
              setSort(e.target.value as "asc" | "desc");
              setPage(1);
            }}
          >
            <option value="desc">Nyast först</option>
            <option value="asc">Äldst först</option>
          </select>
        </div>
      </div>

      <RatingSummary reviews={reviews} />

      {loadingReviews && (
        <p className={styles.message}>
          Laddar recensioner...
        </p>
      )}

      <div className={styles.reviewList}>
        {reviews.map((review) => (
          <ReviewCard
            key={review.id}
            review={review}
            isOwner={review.user?.id === userId}
            isAuthenticated={isAuthenticated}
            isLikeLoading={toggleLikeMutation.isPending}
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
      </div>

      {totalPages > 1 && (
        <div className={styles.pagination}>
          <button
            disabled={page === 1}
            onClick={() =>
              setPage((prev) => prev - 1)
            }
          >
            Föregående
          </button>

          <span>
            Sida {page} av {totalPages}
          </span>

          <button
            disabled={page === totalPages}
            onClick={() =>
              setPage((prev) => prev + 1)
            }
          >
            Nästa
          </button>
        </div>
      )}
    </section>

    {/* ================= CREATE REVIEW ================= */}
    {isAuthenticated && (
      <section className={styles.createReview}>
        <h3>Skriv recension</h3>

        <textarea
          className={styles.textarea}
          value={newReview}
          onChange={(e) =>
            setNewReview(e.target.value)
          }
          placeholder="Vad tyckte du om boken?"
        />

        <div className={styles.reviewControls}>
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

          <button
            onClick={handleCreateReview}
            className={styles.submitButton}
          >
            Skicka recension
          </button>
        </div>
      </section>
    )}
  </div>
);
}
