import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import HomePage from "./pages/HomePage";
import BookDetailsPage from "./pages/BookDetailsPage";
import LoginPage from "./pages/LoginPage";
import { useAuth } from "./context/AuthContext";

export default function App() {

   const { isAuthenticated, logout } = useAuth();
  return (
       <BrowserRouter>
      <div style={{ padding: "1rem", borderBottom: "1px solid #ccc" }}>
        <Link to="/" style={{ marginRight: "1rem" }}>
          Hem
        </Link>

        {!isAuthenticated && (
          <Link to="/login">Logga in</Link>
        )}

        {isAuthenticated && (
          <button onClick={logout} style={{ marginLeft: "1rem" }}>
            Logga ut
          </button>
        )}
      </div>

    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/book/:id" element={<BookDetailsPage />} />
      <Route path="/login" element={<LoginPage />} />
    </Routes>
    </BrowserRouter>
  );
}