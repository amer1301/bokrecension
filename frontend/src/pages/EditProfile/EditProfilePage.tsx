import { useAuth } from "../../context/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import toast from "react-hot-toast";
import { getUser, updateUser } from "../../api/userApi";

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

      <input
        type="text"
        placeholder="Användarnamn"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />

      <input
        type="text"
        placeholder="Profilbild URL"
        value={avatarUrl}
        onChange={(e) => setAvatarUrl(e.target.value)}
      />

      <button className="outlineButton" onClick={handleSave}>
        Spara
      </button>
    </div>
  );
}