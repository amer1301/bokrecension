import BookCard from "../BookCard/BookCard";
import styles from "./BookList.module.css";

type Props = {
  books: any[];
};

export default function BookList({ books }: Props) {
  return (
    <div className={styles.bookGrid}>
      {books.map((book) => (
        <BookCard
          key={book.id}
          id={book.id}
          title={book.volumeInfo.title}
          authors={book.volumeInfo.authors}
          thumbnail={book.volumeInfo.imageLinks?.thumbnail}
        />
      ))}
    </div>
  );
}