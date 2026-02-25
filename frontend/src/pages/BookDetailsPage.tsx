import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import RatingSummary from "../components/RatingSummary";
import { likeReview, unlikeReview } from "../api/reviewApi";

import { getBookDetails } from "../api/bookApi";
import {
  getReviews,
  createReview,
  updateReview,
  deleteReview,
} from "../api/reviewApi";
import {
  getReadingStatus,
  updateReadingStatus,
} from "../api/readingStatusApi";

/* =========================
   TYPER
========================= */

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

/* =========================
   HJÄLPFUNKTIONER
========================= */

const formatRelativeTime = (dateString: string) => {
  const diff = Date.now() - new Date(dateString).getTime();
  const minutes = Math.floor(diff / 60000);

  if (minutes < 1) return "Just nu";
  if (minutes < 60) return `${minutes} min sedan`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} h sedan`;

  const days = Math.floor(hours / 24);
  return `${days} dagar sedan`;
};

const getUserIdFromToken = (token: string) => {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.userId;
  } catch {
    return null;
  }
};

/* =========================
   KOMPONENT
========================= */

export default function BookDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const { token, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  const currentUserId = token ? getUserIdFromToken(token) : null;

  /* =========================
     LOKAL STATE (endast UI)
  ========================= */

  const [newReview, setNewReview] = useState("");
  const [rating, setRating] = useState(5);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [editRating, setEditRating] = useState(5);

  const [readingStatus, setReadingStatus] = useState<string | null>(null);
  const [pagesRead, setPagesRead] = useState<number>(0);

  /* =========================
     HÄMTA BOK
  ========================= */

  const {
    data: book,
    isLoading: loadingBook,
    isError: bookError,
  } = useQuery({
    queryKey: ["book", id],
    queryFn: () => getBookDetails(id!),
    enabled: !!id,
  });

  /* =========================
     HÄMTA RECENSIONER
  ========================= */

  const {
    data: reviews = [],
    isLoading: loadingReviews,
  } = useQuery<Review[]>({
    queryKey: ["reviews", id],
    queryFn: () => getReviews(id!),
    enabled: !!id,
  });

  /* =========================
     HÄMTA LÄSSTATUS
  ========================= */

  const {
    data: readingData,
    isLoading: loadingStatus,
  } = useQuery({
    queryKey: ["readingStatus", id],
    queryFn: () => getReadingStatus(token!, id!),
    enabled: !!token && !!id,
  });

  useEffect(() => {
    if (readingData) {
      setReadingStatus(readingData.status);
      setPagesRead(readingData.pagesRead ?? 0);
    }
  }, [readingData]);

  /* =========================
   MUTATIONS
========================= */

const createReviewMutation = useMutation({
  mutationFn: (data: {
    bookId: string;
    text: string;
    rating: number;
  }) => createReview(token!, data),

  // OPTIMISTIC UPDATE
  onMutate: async (newReview) => {
    await queryClient.cancelQueries({
      queryKey: ["reviews", id],
    });

    const previousReviews =
      queryClient.getQueryData<Review[]>([
        "reviews",
        id,
      ]);

    const optimisticReview: Review = {
      id: "temp-" + Date.now(),
      text: newReview.text,
      rating: newReview.rating,
      createdAt: new Date().toISOString(),
      likesCount: 0,
isLikedByUser: false,
      user: {
        id: currentUserId!,
        email: "Du",
      },
    };

    queryClient.setQueryData<Review[]>(
      ["reviews", id],
      (old = []) => [...old, optimisticReview]
    );

    return { previousReviews };
  },

  // Rollback om något går fel
  onError: (_err, _newReview, context) => {
    queryClient.setQueryData(
      ["reviews", id],
      context?.previousReviews
    );
  },

  // Sync med servern
  onSettled: () => {
    queryClient.invalidateQueries({
      queryKey: ["reviews", id],
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

  onSuccess: () => {
    queryClient.invalidateQueries({
      queryKey: ["reviews", id],
    });
  },
});


const deleteReviewMutation = useMutation({
  mutationFn: (reviewId: string) =>
    deleteReview(token!, reviewId),

  // OPTIMISTIC DELETE
  onMutate: async (reviewId) => {
    await queryClient.cancelQueries({
      queryKey: ["reviews", id],
    });

    const previousReviews =
      queryClient.getQueryData<Review[]>([
        "reviews",
        id,
      ]);

    queryClient.setQueryData<Review[]>(
      ["reviews", id],
      (old = []) =>
        old.filter(
          (review) => review.id !== reviewId
        )
    );

    return { previousReviews };
  },

  // Rollback vid fel
  onError: (_err, _reviewId, context) => {
    queryClient.setQueryData(
      ["reviews", id],
      context?.previousReviews
    );
  },

  // Sync med server
  onSettled: () => {
    queryClient.invalidateQueries({
      queryKey: ["reviews", id],
    });
  },
});


const updateStatusMutation = useMutation({
  mutationFn: (data: {
    bookId: string;
    status: string;
    pagesRead: number;
  }) => updateReadingStatus(token!, data),

  onSuccess: () => {
    queryClient.invalidateQueries({
      queryKey: ["readingStatus", id],
    });
  },
});

const toggleLikeMutation = useMutation({
  mutationFn: (data: {
    reviewId: string;
    isLiked: boolean;
  }) =>
    data.isLiked
      ? unlikeReview(token!, data.reviewId)
      : likeReview(token!, data.reviewId),

  onMutate: async ({ reviewId, isLiked }) => {
    await queryClient.cancelQueries({
      queryKey: ["reviews", id],
    });

    const previous =
      queryClient.getQueryData<Review[]>([
        "reviews",
        id,
      ]);

    queryClient.setQueryData<Review[]>(
      ["reviews", id],
      (old = []) =>
        old.map((review) => {
          if (review.id !== reviewId)
            return review;

          return {
            ...review,
            isLikedByUser: !isLiked,
            likesCount: isLiked
              ? review.likesCount - 1
              : review.likesCount + 1,
          };
        })
    );

    return { previous };
  },

  onError: (_err, _vars, context) => {
    queryClient.setQueryData(
      ["reviews", id],
      context?.previous
    );
  },

  onSettled: () => {
    queryClient.invalidateQueries({
      queryKey: ["reviews", id],
    });
  },
});
  /* =========================
     HANDLERS
  ========================= */

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

  const handleUpdateReview = (reviewId: string) => {
    updateReviewMutation.mutate({
      reviewId,
      text: editText,
      rating: editRating,
    });

    setEditingId(null);
  };

  const handleDeleteReview = (reviewId: string) => {
    deleteReviewMutation.mutate(reviewId);
  };

  const handleStatusChange = (newStatus: string) => {
    if (!newStatus) return;

    updateStatusMutation.mutate({
      bookId: id!,
      status: newStatus,
      pagesRead,
    });

    setReadingStatus(newStatus);
  };

  /* =========================
     RENDER
  ========================= */

  if (loadingBook) return <p>Laddar bok...</p>;
  if (bookError) return <p>Ett fel uppstod.</p>;
  if (!book) return <p>Ingen bok hittades.</p>;

  return (
    <div style={{ padding: "2rem" }}>
      <h1>{book.volumeInfo.title}</h1>

      {book.volumeInfo.authors && (
        <p>
          <strong>Författare:</strong>{" "}
          {book.volumeInfo.authors.join(", ")}
        </p>
      )}

      <hr style={{ margin: "2rem 0" }} />

      {/* =========================
         LÄSSTATUS
      ========================= */}

      {isAuthenticated && (
        <div style={{ marginBottom: "2rem" }}>
          <h3>Min lässtatus</h3>

          {loadingStatus ? (
            <p>Laddar status...</p>
          ) : (
            <>
              <select
                value={readingStatus ?? ""}
                onChange={(e) =>
                  handleStatusChange(e.target.value)
                }
              >
                <option value="">Välj status</option>
                <option value="want_to_read">Vill läsa</option>
                <option value="reading">Läser</option>
                <option value="finished">Klar</option>
              </select>

              {readingStatus === "reading" &&
                book.volumeInfo.pageCount && (
                  <div style={{ marginTop: "1rem" }}>
                    <input
                      type="number"
                      min={0}
                      value={pagesRead}
                      onChange={(e) =>
                        setPagesRead(Number(e.target.value))
                      }
                    />

                    <div
                      style={{
                        height: "10px",
                        background: "#eee",
                        marginTop: "0.5rem",
                      }}
                    >
                      <div
                        style={{
                          height: "100%",
                          width: `${
                            (pagesRead /
                              book.volumeInfo.pageCount) *
                            100
                          }%`,
                          background: "#4caf50",
                        }}
                      />
                    </div>
                  </div>
                )}
            </>
          )}
        </div>
      )}

      {/* =========================
         RECENSIONER
      ========================= */}

      <h2>Recensioner</h2>

      <RatingSummary reviews={reviews} />

      {loadingReviews && <p>Laddar recensioner...</p>}
{reviews.map((review) => {
  const isOwner =
    review.user?.id === currentUserId;

  return (
    <div
      key={review.id}
      style={{
        border: "1px solid #ddd",
        padding: "1rem",
        marginBottom: "1rem",
        borderRadius: "10px",
      }}
    >
      <strong>{review.user?.email}</strong>

      <p
        style={{
          fontSize: "0.8rem",
          color: "#666",
          marginTop: "0.3rem",
        }}
      >
        {formatRelativeTime(review.createdAt)}
      </p>

      {/* =========================
         EDIT MODE
      ========================= */}
      {editingId === review.id ? (
        <>
          <textarea
            value={editText}
            onChange={(e) =>
              setEditText(e.target.value)
            }
            rows={3}
            style={{ width: "100%" }}
          />

          <select
            value={editRating}
            onChange={(e) =>
              setEditRating(
                Number(e.target.value)
              )
            }
            style={{ marginTop: "0.5rem" }}
          >
            {[1, 2, 3, 4, 5].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>

          <div style={{ marginTop: "0.5rem" }}>
            <button
              onClick={() =>
                handleUpdateReview(
                  review.id
                )
              }
            >
              Spara
            </button>

            <button
              onClick={() =>
                setEditingId(null)
              }
              style={{
                marginLeft: "0.5rem",
              }}
            >
              Avbryt
            </button>
          </div>
        </>
      ) : (
        <>
          <p>Betyg: {review.rating} ⭐</p>
          <p>{review.text}</p>

          {/* ❤️ LIKE KNAPP */}
          {isAuthenticated && (
            <button
              onClick={() =>
                toggleLikeMutation.mutate({
                  reviewId: review.id,
                  isLiked:
                    review.isLikedByUser,
                })
              }
              style={{
                marginTop: "0.5rem",
                cursor: "pointer",
              }}
            >
              {review.isLikedByUser
                ? "❤️"
                : "🤍"}{" "}
              {review.likesCount}
            </button>
          )}

          {/* OWNER ACTIONS */}
          {isOwner && (
            <div
              style={{
                marginTop: "0.5rem",
              }}
            >
              <button
                onClick={() => {
                  setEditingId(
                    review.id
                  );
                  setEditText(
                    review.text
                  );
                  setEditRating(
                    review.rating
                  );
                }}
              >
                Redigera
              </button>

              <button
                onClick={() =>
                  handleDeleteReview(
                    review.id
                  )
                }
                style={{
                  marginLeft: "0.5rem",
                }}
              >
                Ta bort
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
})}

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
      rows={4}
      style={{ width: "100%" }}
    />

    <select
      value={rating}
      onChange={(e) =>
        setRating(Number(e.target.value))
      }
      style={{ marginTop: "0.5rem" }}
    >
      {[1, 2, 3, 4, 5].map((n) => (
        <option key={n} value={n}>
          {n}
        </option>
      ))}
    </select>

    <button
      onClick={handleCreateReview}
      style={{ marginTop: "0.5rem" }}
    >
      Skicka recension
    </button>
  </div>
)}
    </div>
  );
}