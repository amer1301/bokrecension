import { Link } from "react-router-dom";
import styles from "./BookCard.module.css";

type Props = {
  id: string;
  title: string;
  authors?: string[];
  thumbnail?: string;
  rating?: number;
};

export default function BookCard({
  id,
  title,
  authors,
  thumbnail,
  rating,
}: Props) {
  return (
    <Link to={`/book/${id}`} className={`${styles.card} ${styles.bookCard}`}>
      
      {thumbnail && (
        <img
          src={thumbnail}
          alt={title}
          className={styles.bookCover}
        />
      )}

      <h3 className={styles.title}>{title}</h3>

      {authors && (
        <p className={styles.author}>
          {authors.join(", ")}
        </p>
      )}

      {rating && (
        <p className={styles.rating}>
          ⭐ {rating}
        </p>
      )}

    </Link>
  );
}