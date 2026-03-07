import { useEffect, useState } from "react";
import { getNotifications } from "../../api/notificationApi";

export default function NotificationsPage() {

  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {

    const load = async () => {
      const token = localStorage.getItem("token") || "";
      const data = await getNotifications(token);
      setNotifications(data);
    };

    load();

  }, []);

  return (

    <div>

      <h1>Notifikationer</h1>

      {notifications.map((n) => (
        <div key={n.id}>
          {n.type}
        </div>
      ))}

    </div>

  );

}