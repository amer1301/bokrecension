import { useState, useEffect } from "react";
import styles from "./ReviewCard.module.css";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import {
  getComments,
  createComment,
  deleteComment
} from "../../api/commentApi";
import { useAuth } from "../../context/AuthContext";

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
  bookId: string;
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

  const { userId, token } = useAuth();
  const navigate = useNavigate();

  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(review.text);
  const [rating, setRating] = useState(review.rating);

  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState("");

  /* =========================
     LOAD COMMENTS
  ========================= */

  useEffect(() => {

    const loadComments = async () => {

      try {

        const data = await getComments(review.id);

        setComments(data);

      } catch {

        toast.error("Kunde inte hämta kommentarer");

      }

    };

    loadComments();

  }, [review.id]);

  /* =========================
     CREATE COMMENT
  ========================= */

  const handleComment = async (e: React.MouseEvent) => {

    e.stopPropagation();

    if (!commentText.trim()) {
      toast.error("Kommentaren kan inte vara tom");
      return;
    }

    try {

      if (!token) return;

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
     DELETE COMMENT
  ========================= */

  const handleDeleteComment = async (commentId: string, e: React.MouseEvent) => {

    e.stopPropagation();

    if (!token) return;

    try {

      await deleteComment(token, commentId);

      setComments((prev) =>
        prev.filter((c) => c.id !== commentId)
      );

      toast.success("Kommentar borttagen");

    } catch {

      toast.error("Kunde inte ta bort kommentar");

    }

  };

  /* =========================
     UPDATE REVIEW
  ========================= */

  const handleSave = (e: React.MouseEvent) => {

    e.stopPropagation();

    if (!text.trim()) {
      toast.error("Recensionen kan inte vara tom");
      return;
    }

    onUpdate(review.id, text, rating);

    toast.success("Recension uppdaterad ✏️");

    setEditing(false);

  };

  return (

    <div
      className={styles.reviewCard}
      onClick={() => navigate(`/book/${review.bookId}`)}
      style={{ cursor: "pointer" }}
    >

      {/* LIKE BUTTON */}

      {isAuthenticated && (

        <button
          className={`${styles.heartButton} ${
            review.isLikedByUser ? styles.liked : ""
          }`}
          disabled={isLikeLoading}
          onClick={(e) => {

            e.stopPropagation();

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

      {/* HEADER */}

      <div className={styles.header}>

        <div>

          <Link
            to={`/user/${review.user?.id}`}
            className={styles.username}
            onClick={(e) => e.stopPropagation()}
          >
            {review.user?.username ?? "Okänd användare"}
          </Link>

          <div className={styles.date}>
            {new Date(review.createdAt).toLocaleDateString()}
          </div>

        </div>

      </div>

      {/* EDIT MODE */}

      {editing ? (

        <>

          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            className={styles.textarea}
            onClick={(e) => e.stopPropagation()}
          />

          <select
            value={rating}
            onChange={(e) => setRating(Number(e.target.value))}
            className={styles.select}
            onClick={(e) => e.stopPropagation()}
          >

            {[1,2,3,4,5].map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}

          </select>

          <div className={styles.actions}>

            <button onClick={handleSave} className="outlineButton">
              Spara
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                setEditing(false);
              }}
              className="outlineButton"
            >
              Avbryt
            </button>

          </div>

        </>

      ) : (

        <>

          <div className={styles.rating}>
            Betyg: {review.rating} / 5
          </div>

          <p className={styles.text}>
            {review.text}
          </p>

          {isOwner && (

            <div className={styles.actions}>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setEditing(true);
                }}
                className={styles.editButton}
              >
                Redigera
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
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

      {/* COMMENTS */}

      <div
        className={styles.commentsSection}
        onClick={(e) => e.stopPropagation()}
      >

        <div className={styles.commentHeader}>
          💬 Kommentarer ({comments.length})
        </div>

        <div className={styles.commentList}>

          {comments.map((c) => (

            <div key={c.id} className={styles.comment}>

              <div className={styles.commentTop}>

                <strong>{c.user.username}</strong>

                {c.user.id === userId && (

                  <button
                    className={styles.deleteComment}
                    onClick={(e) => handleDeleteComment(c.id, e)}
                  >
                    Ta bort
                  </button>

                )}

              </div>

              <p>{c.text}</p>

            </div>

          ))}

        </div>

        {isAuthenticated && (

          <div className={styles.commentForm}>

            <input
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Skriv en kommentar..."
            />

            <button
              onClick={handleComment}
              className="outlineButton"
            >
              Skicka
            </button>

          </div>

        )}

      </div>

    </div>

  );

}