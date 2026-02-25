import styles from "./LibraryBookCard.module.css";

interface Props {
  title: string;
  image: string;
  status: string;
}

export default function LibraryBookCard({ title, image, status }: Props) {
  return (
    <div className={styles.card}>
      <img src={image} alt={title} />
      <div className={styles.info}>
        <h3>{title}</h3>
        <p>{status}</p>
      </div>
    </div>
  );
}