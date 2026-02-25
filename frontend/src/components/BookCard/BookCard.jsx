import styles from "./BookCard.module.css";

export default function BookCard({ title, author, rating }) {
  return (
    <div className={styles.card}>
      <h3 className={styles.title}>{title}</h3>
      <p className={styles.author}>{author}</p>
      <p className={styles.rating}>⭐ {rating}</p>
    </div>
  );
}