import { useAuth } from "../../context/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import toast from "react-hot-toast";
import { getUser, updateUser } from "../../api/userApi";
import styles from "./EditProfilePage.module.css";

export default function EditProfilePage() {
  const { token } = useAuth();

  const decoded = JSON.parse(atob(token!.split(".")[1]));
  const userId = decoded.userId;

  const { data } = useQuery({
    queryKey: ["user", userId],
    queryFn: () => getUser(userId),
  });

  const [username, setUsername] = useState(data?.username || "");
  const [avatarUrl, setAvatarUrl] = useState(data?.avatarUrl || "");

  const handleSave = async () => {
    try {
      await updateUser(userId, {
        username,
        avatarUrl,
      });

      toast.success("Profil uppdaterad");
    } catch {
      toast.error("Kunde inte uppdatera profil");
    }
  };

  if (!data) return null;

  return (
<div className="container">
  <h1>Redigera profil</h1>

  <form
    onSubmit={(e) => {
      e.preventDefault();
      handleSave();
    }}
  >

    <label htmlFor="username" className={styles.srOnly}>
      Användarnamn
    </label>
    <input
      id="username"
      type="text"
      placeholder="Användarnamn"
      value={username}
      onChange={(e) => setUsername(e.target.value)}
    />

    <label htmlFor="avatarUrl" className={styles.srOnly}>
      Profilbild URL
    </label>
    <input
      id="avatarUrl"
      type="text"
      placeholder="Profilbild URL"
      value={avatarUrl}
      onChange={(e) => setAvatarUrl(e.target.value)}
    />

    <button type="submit" className="outlineButton">
      Spara
    </button>

  </form>
</div>
  );
}