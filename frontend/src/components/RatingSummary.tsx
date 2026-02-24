type RatingSummaryProps = {
    reviews: { rating: number }[];
};

export default function RatingSummary({ reviews }: RatingSummaryProps) {
    if (reviews.length === 0) {
        return <p>Inga recensioner ännu.</p>;
    }

const average =
  reviews.reduce((sum, r) => sum + r.rating, 0) /
  reviews.length;

    return (
        <div style={{ marginBottom: "1rem" }}>
            <strong>
            ⭐ {average.toFixed(1)} / 5    
            </strong>{" "}
            ({reviews.length} recensioner)
        </div>
    );
}