import { Link } from "react-router-dom";

type Props = {
    id: string,
    title: string,
    authors?: string[];
};

export default function BookCard({ id, title, authors }: Props) {
    return (
        <div>
            <Link to={`/book/${id}`}>
            <h3>{title}</h3>
            </Link>

            {authors && <p>{authors.join(", ")}</p>}
        </div>
    );
}