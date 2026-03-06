import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import styles from "./Login.module.css";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

import { loginUser } from "../../api/authApi";

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
      const data = await loginUser(email, password);

      // Spara token
      login(data.token);

      // Visa toast
      toast.success("Inloggad!");

      // Navigera till startsidan
      navigate("/");

    } catch (err) {

      const message =
        err instanceof Error ? err.message : "Inloggning misslyckades";

      setError(message);

      toast.error(message);

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

        <p className={styles.registerText}>
          Har du inget konto?{" "}
          <Link to="/register">
            Registrera dig här
          </Link>
        </p>
      </div>
    </div>
  );
}