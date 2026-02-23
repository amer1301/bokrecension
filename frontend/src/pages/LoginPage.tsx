import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function LoginPage() {
    const navigate = useNavigate();

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
            localStorage.setItem("token", data.token);

            //Navigera till startsidan
            navigate("/");
        } catch (err) {
            setError(err instanceof Error ? err.message : "Ett fel uppstod");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: "1rem" }}>
            <h1>Logga in</h1>

            <form onSubmit={handleLogin}>
                <div style={{ marginBottom: "1rem" }}>
                    <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    />
                </div>

                <div style={{ marginBottom: "1rem" }}>
                    <input
                    type="password"
                    placeholder="Lösenord"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    />
                </div>

                <button type="submit" disabled={loading}>
                    {loading ? "Loggar in..." : "Logga in"}
                </button>
            </form>

            {error && (
                <p style={{ color: "red", marginTop: "1rem" }}>
                    {error}
                </p>
            )}
        </div>
    );
}