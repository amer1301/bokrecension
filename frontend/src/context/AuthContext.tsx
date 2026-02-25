import { createContext, useContext, useState, useEffect } from "react";

type AuthContextType = {
  token: string | null;
  isAuthenticated: boolean;
  userId: string | null;
  login: (token: string) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("token")
  );

  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    if (token) {
      const payload = JSON.parse(
        atob(token.split(".")[1])
      );
      setUserId(payload.userId);
    } else {
      setUserId(null);
    }
  }, [token]);

  const login = (newToken: string) => {
    localStorage.setItem("token", newToken);
    setToken(newToken);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        isAuthenticated: !!token,
        userId,
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
  if (!context)
    throw new Error("useAuth måste användas inom AuthProvider");
  return context;
};