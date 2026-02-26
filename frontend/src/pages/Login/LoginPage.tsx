import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import styles from "./Login.module.css";

export default function LoginPage() {
    const navigate = useNavigate();
    const { login } = useAuth();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();

        setLoading(true);
        setError(null);

        try {
            const response = await fetch("http://localhost:3000/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Inloggning misslyckades");
            }

            //Spara token
            login(data.token);

            //Navigera till startsidan
            navigate("/");
        } catch (err) {
            setError(err instanceof Error ? err.message : "Ett fel uppstod");
        } finally {
            setLoading(false);
        }
    };

return (
  <div className={styles.wrapper}>
    <div className={styles.card}>
      <h1>Logga in</h1>

      <form onSubmit={handleLogin}>
        <div className={styles.inputGroup}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className={styles.inputGroup}>
          <input
            type="password"
            placeholder="Lösenord"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button
          type="submit"
          className={styles.button}
          disabled={loading}
        >
          {loading ? "Loggar in..." : "Logga in"}
        </button>
      </form>

      {error && (
        <p className={styles.error}>
          {error}
        </p>
      )}
    </div>
  </div>
);
}