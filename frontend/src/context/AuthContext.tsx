import { createContext, useContext, useState, useEffect } from "react";

type AuthContextType = {
  token: string | null;
  isAuthenticated: boolean;
  userId: string | null;
  loading: boolean;
  login: (token: string) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {

  const [token, setToken] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  /* =========================
     LOAD TOKEN ON APP START
  ========================= */

  useEffect(() => {

    const storedToken = localStorage.getItem("token");

    if (storedToken) {

      setToken(storedToken);

      try {

        const payload = JSON.parse(
          atob(storedToken.split(".")[1])
        );

        setUserId(payload.userId);

      } catch {

        console.error("Invalid token");

        localStorage.removeItem("token");

        setToken(null);
        setUserId(null);

      }

    }

    setLoading(false);

  }, []);

  /* =========================
     LOGIN
  ========================= */

  const login = (newToken: string) => {

    localStorage.setItem("token", newToken);

    setToken(newToken);

    try {

      const payload = JSON.parse(
        atob(newToken.split(".")[1])
      );

      setUserId(payload.userId);

    } catch {

      console.error("Invalid token payload");

    }

  };

  /* =========================
     LOGOUT
  ========================= */

  const logout = () => {

    localStorage.removeItem("token");

    setToken(null);
    setUserId(null);

  };

  return (
    <AuthContext.Provider
      value={{
        token,
        isAuthenticated: !!token,
        userId,
        loading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );

}

export const useAuth = () => {

  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth måste användas inom AuthProvider");
  }

  return context;

};