import { useState } from "react";

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

interface Props {
  review: Review;
  isOwner: boolean;
  isAuthenticated: boolean;
  onDelete: (id: string) => void;
  onUpdate: (id: string, text: string, rating: number) => void;
  onToggleLike: (id: string, isLiked: boolean) => void;
}

export default function ReviewCard({
  review,
  isOwner,
  isAuthenticated,
  onDelete,
  onUpdate,
  onToggleLike,
}: Props) {
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(review.text);
  const [rating, setRating] = useState(review.rating);

  return (
    <div className="review-card">
      <strong>{review.user?.email}</strong>

      {editing ? (
        <>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <select
            value={rating}
            onChange={(e) =>
              setRating(Number(e.target.value))
            }
          >
            {[1, 2, 3, 4, 5].map((n) => (
              <option key={n}>{n}</option>
            ))}
          </select>

          <button
            onClick={() => {
              onUpdate(review.id, text, rating);
              setEditing(false);
            }}
          >
            Spara
          </button>
          <button onClick={() => setEditing(false)}>
            Avbryt
          </button>
        </>
      ) : (
        <>
          <p>{review.rating} ⭐</p>
          <p>{review.text}</p>

          {isAuthenticated && (
            <button
              onClick={() =>
                onToggleLike(
                  review.id,
                  review.isLikedByUser
                )
              }
            >
              {review.isLikedByUser
                ? "❤️"
                : "🤍"}{" "}
              {review.likesCount}
            </button>
          )}

          {isOwner && (
            <>
              <button onClick={() => setEditing(true)}>
                Redigera
              </button>
              <button
                onClick={() =>
                  onDelete(review.id)
                }
              >
                Ta bort
              </button>
            </>
          )}
        </>
      )}
    </div>
  );
}