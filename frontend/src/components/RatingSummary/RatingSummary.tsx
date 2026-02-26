import styles from "./RatingSummary.module.css";

type Review = {
  rating: number;
};

interface Props {
  reviews: Review[];
}

export default function RatingSummary({ reviews }: Props) {
  const total = reviews.length;

  const average =
    total === 0
      ? 0
      : (
          reviews.reduce((sum, r) => sum + r.rating, 0) / total
        ).toFixed(1);

  const distribution = [5, 4, 3, 2, 1].map((value) => {
    const count = reviews.filter(
      (r) => r.rating === value
    ).length;

    const percentage =
      total === 0 ? 0 : (count / total) * 100;

    return { value, count, percentage };
  });

  return (
    <div className={styles.summaryCard}>
      <div className={styles.averageSection}>
        <div className={styles.averageValue}>
          {average}
        </div>
        <div className={styles.total}>
          {total} recensioner
        </div>
      </div>

      <div className={styles.distribution}>
        {distribution.map((item) => (
          <div
            key={item.value}
            className={styles.row}
          >
            <span className={styles.label}>
              {item.value}
            </span>

            <div className={styles.barContainer}>
              <div
                className={styles.bar}
                style={{
                  width: `${item.percentage}%`,
                }}
              />
            </div>

            <span className={styles.count}>
              {item.count}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}