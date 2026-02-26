import { useState } from "react";
import styles from "./ReviewCard.module.css";
import { FaHeart, FaRegHeart } from "react-icons/fa";

type Review = {
  id: string;
  text: string;
  rating: number;
  createdAt: string;
  likesCount: number;
  isLikedByUser: boolean;
  user?: {
    id: string;
    username: string;
  };
};

interface Props {
  review: Review;
  isOwner: boolean;
  isAuthenticated: boolean;
  isLikeLoading: boolean;
  onDelete: (id: string) => void;
  onUpdate: (id: string, text: string, rating: number) => void;
  onToggleLike: (id: string, isLiked: boolean) => void;
}

export default function ReviewCard({
  review,
  isOwner,
  isAuthenticated,
  isLikeLoading,
  onDelete,
  onUpdate,
  onToggleLike,
}: Props) {
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(review.text);
  const [rating, setRating] = useState(review.rating);

  const handleSave = () => {
    if (!text.trim()) return;

    onUpdate(review.id, text, rating);
    setEditing(false);
  };

  return (
  <div className={styles.reviewCard}>

    {/* ❤️ Heart (absolut positionerad) */}
    {isAuthenticated && (
      <button
        className={`${styles.heartButton} ${
          review.isLikedByUser ? styles.liked : ""
        }`}
        disabled={isLikeLoading}
        onClick={() =>
          onToggleLike(review.id, review.isLikedByUser)
        }
      >
        {review.isLikedByUser ? <FaHeart /> : <FaRegHeart />}
        <span>{review.likesCount}</span>
      </button>
    )}

    {/* ===== HEADER ===== */}
    <div className={styles.header}>
      <div>
        <span className={styles.username}>
          {review.user?.username ?? "Okänd användare"}
        </span>
        <div className={styles.date}>
          {new Date(review.createdAt).toLocaleDateString()}
        </div>
      </div>
    </div>

    {/* ===== EDIT MODE ===== */}
    {editing ? (
      <>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          className={styles.textarea}
        />

        <select
          value={rating}
          onChange={(e) => setRating(Number(e.target.value))}
          className={styles.select}
        >
          {[1, 2, 3, 4, 5].map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>

        <div className={styles.actions}>
          <button
            onClick={handleSave}
            className={styles.saveButton}
          >
            Spara
          </button>

          <button
            onClick={() => setEditing(false)}
            className={styles.cancelButton}
          >
            Avbryt
          </button>
        </div>
      </>
    ) : (
      <>
        {/* ===== NORMAL VIEW ===== */}
        <div className={styles.rating}>
          Betyg: {review.rating} / 5
        </div>

        <p className={styles.text}>{review.text}</p>

        {isOwner && (
          <div className={styles.actions}>
            <button
              onClick={() => setEditing(true)}
              className={styles.editButton}
            >
              Redigera
            </button>

            <button
              onClick={() => onDelete(review.id)}
              className={styles.deleteButton}
            >
              Ta bort
            </button>
          </div>
        )}
      </>
    )}
  </div>
);
}