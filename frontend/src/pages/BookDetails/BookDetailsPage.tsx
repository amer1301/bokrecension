import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import styles from "./BookDetails.module.css";

import RatingSummary from "../../components/RatingSummary/RatingSummary";
import ReviewCard from "../../components/ReviewCard/ReviewCard";
import ReadingStatusSection from "../../components/ReadingStatus/ReadingStatusSection";
import Spinner from "../../components/Spinner/Spinner";

import { getBookDetails } from "../../api/bookApi";

import {
  getReviews,
  createReview,
  updateReview,
  deleteReview,
} from "../../api/reviewApi";

import {
  likeReview,
  unlikeReview,
} from "../../api/likeApi";

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
  const [description, setDescription] = useState<string>("");

  /* ================= FETCH GOOGLE BOOK DESCRIPTION ================= */

  useEffect(() => {
    async function fetchBookDescription() {
      try {
        const res = await fetch(
          `https://www.googleapis.com/books/v1/volumes/${id}`
        );
        const data = await res.json();

        const desc =
          data?.volumeInfo?.description ||
          "Ingen beskrivning tillgänglig.";

        setDescription(desc);
      } catch (err) {
        console.error("Kunde inte hämta bokbeskrivning", err);
        setDescription("Kunde inte ladda beskrivning.");
      }
    }

    if (id) {
      fetchBookDescription();
    }
  }, [id]);

  /* ================= BOOK QUERY ================= */

  const { data: book, isLoading: loadingBook } = useQuery({
    queryKey: ["book", id],
    queryFn: () => getBookDetails(id!),
    enabled: !!id,
  });

  /* ================= REVIEWS QUERY ================= */

  const { data: reviewData, isLoading: loadingReviews } =
    useQuery<PaginatedReviews>({
      queryKey: ["reviews", id, page, sort],
      queryFn: () =>
        getReviews(id!, page, 5, sort, token ?? undefined),
      enabled: !!id,
    });

  const reviews = reviewData?.reviews ?? [];
  const totalPages = reviewData?.pagination.totalPages ?? 1;

  /* ================= CREATE REVIEW ================= */

  const createReviewMutation = useMutation({
    mutationFn: (data: {
      bookId: string;
      text: string;
      rating: number;
    }) => createReview(token!, data),

    onSuccess: () => {
      setPage(1);
      queryClient.invalidateQueries({
        queryKey: ["reviews", id],
      });
    },
  });

  /* ================= UPDATE REVIEW ================= */

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
        queryKey: ["reviews", id],
      }),
  });

  /* ================= DELETE REVIEW ================= */

  const deleteReviewMutation = useMutation({
    mutationFn: (reviewId: string) =>
      deleteReview(token!, reviewId),

    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: ["reviews", id],
      }),
  });

  /* ================= TOGGLE LIKE ================= */

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

    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ["reviews", id],
      });
    },
  });

  /* ================= CREATE REVIEW HANDLER ================= */

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

  /* ================= LOADING STATES ================= */

  if (loadingBook || loadingReviews) {
    return <Spinner />;
  }

  if (!book) {
    return <p>Ingen bok hittades.</p>;
  }

  /* ================= UI ================= */

  return (
    <div className={styles.appContainer}>
      {/* BOOK HEADER */}
      <header className={styles.bookHeader}>
        <h1 className={styles.title}>
          {book.volumeInfo.title}
        </h1>

        <p
          className={styles.description}
          dangerouslySetInnerHTML={{ __html: description }}
        />

        <hr className={styles.divider} />
      </header>

      {/* READING STATUS */}
      {isAuthenticated && token && (
        <ReadingStatusSection
          bookId={id!}
          token={token}
          pageCount={book.volumeInfo.pageCount}
          getReadingStatus={getReadingStatus}
          updateReadingStatus={updateReadingStatus}
        />
      )}

      {/* REVIEWS */}
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

        {/* PAGINATION */}
        {totalPages > 1 && (
          <div className={styles.pagination}>
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
            >
              Föregående
            </button>

            <span>
              Sida {page} av {totalPages}
            </span>

            <button
              disabled={page === totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Nästa
            </button>
          </div>
        )}
      </section>

      {isAuthenticated && (
        <section className={styles.createReview}>
          <h3>Skriv recension</h3>

          <textarea
            className={styles.textarea}
            value={newReview}
            onChange={(e) => setNewReview(e.target.value)}
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