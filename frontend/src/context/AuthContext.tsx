import { createContext, useContext, useEffect, useState } from "react";

type AuthContextType = {
    token: string | null;
    isAuthenticated: boolean;
    login: (token: string) => void;
    logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [token, setToken] = useState<string | null>(null);

    //Ladda token från LocalStorage vid start
    useEffect(() => {
        const storedToken = localStorage.getItem("token");
        if (storedToken) {
            setToken(storedToken);
        }
    }, []);

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
            isAuthenticated: !!token, //boolean
            login,
            logout,
        }}
        >
            {children}
        </AuthContext.Provider>
    );
}

//Custom hook
export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth måste användas inom AuthProvider");
    }
    return context;
}