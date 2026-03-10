import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import styles from "./Register.module.css";
import toast from "react-hot-toast";
import { registerUser } from "../../api/authApi";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    setError(null);

    try {
      await registerUser(email, password);

      toast.success("Konto skapat! Du kan nu logga in.");
      navigate("/login");

    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Registrering misslyckades";

      setError(message);
      toast.error(message);

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.card}>
        <h1>Registrera</h1>

        <form onSubmit={handleRegister}>

          <div className={styles.inputGroup}>
            <label htmlFor="email" className={styles.srOnly}>
              Email
            </label>
            <input
              id="email"
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="password" className={styles.srOnly}>
              Lösenord
            </label>
            <input
              id="password"
              type="password"
              placeholder="Lösenord"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="new-password"
            />
          </div>

          <button
            type="submit"
            className={styles.button}
            disabled={loading}
          >
            {loading ? "Skapar konto..." : "Registrera"}
          </button>

        </form>

        {error && (
          <p className={styles.error}>
            {error}
          </p>
        )}

        <p className={styles.loginText}>
          Har du redan konto? <Link to="/login">Logga in</Link>
        </p>

      </div>
    </div>
  );
}