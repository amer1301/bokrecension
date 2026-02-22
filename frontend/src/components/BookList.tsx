import BookCard from "./BookCard";

type Props = {
    books: any[];
};

export default function BookList({ books }: Props) {
    return (
        <div>
        {books.map((book) => (
            <BookCard
            key={book.id}
            id={book.id}
            title={book.volumeInfo.title}
            authors={book.volumeInfo.authors}
            />
        ))}
        </div>
    );
}