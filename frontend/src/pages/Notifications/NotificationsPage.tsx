import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { getNotifications } from "../../api/notificationApi";
import { Link } from "react-router-dom";
import styles from "./NotificationsPage.module.css";

type Notification = {
  id: string;
  type: string;
  createdAt?: string;

  actor?: {
    username: string;
  };

  review?: {
    id: string;
    bookId: string;
  };
};

export default function NotificationsPage() {

  const { token } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {

    if (!token) return;

    let isMounted = true;

    const load = async () => {

      try {

        const data = await getNotifications(token);

        if (isMounted) {
          setNotifications(data ?? []);
        }

      } catch (error) {

        console.error("Could not load notifications", error);

      }

    };

    load();

    return () => {
      isMounted = false;
    };

  }, [token]);

  const getMessage = (n: Notification) => {

    const username = n.actor?.username ?? "Någon";

    switch (n.type) {

      case "LIKE_REVIEW":
        return `❤️ ${username} gillade din recension`;

      case "COMMENT_REVIEW":
        return `💬 ${username} kommenterade din recension`;

      default:
        return `${username} gjorde något`;
    }

  };

  return (

    <div className={styles.container}>

      <h1 className={styles.title}>
        Notifikationer
      </h1>

      {notifications.length === 0 && (
        <p className={styles.empty}>
          Inga notifikationer ännu
        </p>
      )}

      <div className={styles.list}>

        {notifications.map((n) => (

          <Link
            key={n.id}
            to={n.review?.bookId ? `/book/${n.review.bookId}` : "#"}
            className={styles.card}
          >
            <p className={styles.message}>
              {getMessage(n)}
            </p>

            {n.createdAt && (
              <span className={styles.date}>
                {new Date(n.createdAt).toLocaleDateString()}
              </span>
            )}

          </Link>

        ))}

      </div>

    </div>

  );

}