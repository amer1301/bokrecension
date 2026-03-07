import { useState } from "react";
import styles from "./ReviewCard.module.css";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import { getComments, createComment } from "../../api/commentApi";

type Comment = {
  id: string;
  text: string;
  user: {
    id: string;
    username: string;
  };
};

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

  const [comments, setComments] = useState<Comment[]>([]);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");

  /* =========================
     LOAD COMMENTS
  ========================= */

  const loadComments = async () => {
    try {
      const data = await getComments(review.id);
      setComments(data);
    } catch {
      toast.error("Kunde inte hämta kommentarer");
    }
  };

  /* =========================
     CREATE COMMENT
  ========================= */

  const handleComment = async () => {
    if (!commentText.trim()) {
      toast.error("Kommentaren kan inte vara tom");
      return;
    }

    try {
      const token = localStorage.getItem("token") || "";

      const newComment = await createComment(
        token,
        review.id,
        commentText
      );

      setComments((prev) => [newComment, ...prev]);
      setCommentText("");

      toast.success("Kommentar tillagd 💬");
    } catch {
      toast.error("Kunde inte skapa kommentar");
    }
  };

  /* =========================
     UPDATE REVIEW
  ========================= */

  const handleSave = () => {

    if (!text.trim()) {
      toast.error("Recensionen kan inte vara tom");
      return;
    }

    onUpdate(review.id, text, rating);

    toast.success("Recension uppdaterad ✏️");

    setEditing(false);
  };

  return (
    <div className={styles.reviewCard}>

      {/* ❤️ LIKE BUTTON */}
      {isAuthenticated && (
        <button
          className={`${styles.heartButton} ${
            review.isLikedByUser ? styles.liked : ""
          }`}
          disabled={isLikeLoading}
          onClick={() => {

            onToggleLike(review.id, review.isLikedByUser);

            if (review.isLikedByUser) {
              toast("Like borttagen");
            } else {
              toast.success("Du gillade recensionen ❤️");
            }
          }}
        >
          {review.isLikedByUser ? <FaHeart /> : <FaRegHeart />}
          <span>{review.likesCount}</span>
        </button>
      )}

      {/* ===== HEADER ===== */}

      <div className={styles.header}>
        <div>

          <Link
            to={`/user/${review.user?.id}`}
            className={styles.username}
          >
            {review.user?.username ?? "Okänd användare"}
          </Link>

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
              className="outlineButton"
            >
              Spara
            </button>

            <button
              onClick={() => setEditing(false)}
              className="outlineButton"
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

          <p className={styles.text}>
            {review.text}
          </p>

          {isOwner && (
            <div className={styles.actions}>

              <button
                onClick={() => setEditing(true)}
                className={styles.editButton}
              >
                Redigera
              </button>

              <button
                onClick={() => {
                  onDelete(review.id);
                  toast.success("Recension borttagen");
                }}
                className={styles.deleteButton}
              >
                Ta bort
              </button>

            </div>
          )}

        </>
      )}

      {/* =========================
         COMMENTS SECTION
      ========================= */}

      <div className={styles.commentsSection}>

        <button
          className={styles.commentToggle}
          onClick={() => {

            const newState = !showComments;
            setShowComments(newState);

            if (newState && comments.length === 0) {
              loadComments();
            }
          }}
        >
          💬 Kommentarer ({comments.length})
        </button>

        {showComments && (
          <>

            {/* COMMENT LIST */}

            <div className={styles.commentList}>

              {comments.map((c) => (
                <div key={c.id} className={styles.comment}>

                  <strong>{c.user.username}</strong>

                  <p>{c.text}</p>

                </div>
              ))}

            </div>

            {/* COMMENT FORM */}

            {isAuthenticated && (
              <div className={styles.commentForm}>

                <input
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Skriv en kommentar..."
                />

                <button onClick={handleComment}>
                  Skicka
                </button>

              </div>
            )}

          </>
        )}

      </div>

    </div>
  );
}