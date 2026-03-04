import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./pages/Home/HomePage";
import BookDetailsPage from "./pages/BookDetails/BookDetailsPage";
import LoginPage from "./pages/Login/LoginPage";
import ProfilePage from "./pages/Profile/ProfilePage";
import { useAuth } from "./context/AuthContext";
import Navbar from "./components/Navbar/Navbar";
import Footer from "./components/Footer/Footer";
import RegisterPage from "./pages/Register/RegisterPage";

export default function App() {
  const { isAuthenticated, logout } = useAuth();

  return (
    <BrowserRouter>
      <Navbar 
        isAuthenticated={isAuthenticated} 
        logout={logout} 
      />

      <div className="container section">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/book/:id" element={<BookDetailsPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/profil" element={<ProfilePage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Routes>
      </div>
      <Footer />
    </BrowserRouter>
  );
}