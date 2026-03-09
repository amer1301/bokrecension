import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./pages/Home/HomePage";
import BookDetailsPage from "./pages/BookDetails/BookDetailsPage";
import LoginPage from "./pages/Login/LoginPage";
import ProfilePage from "./pages/Profile/ProfilePage";
import { useAuth } from "./context/AuthContext";
import Navbar from "./components/Navbar/Navbar";
import Footer from "./components/Footer/Footer";
import RegisterPage from "./pages/Register/RegisterPage";
import UserProfilePage from "./pages/UserProfile/UserProfilePage";
import EditProfilePage from "./pages/EditProfile/EditProfilePage";
import FeedPage from "./pages/FeedPage/FeedPage";
import NotificationsPage from "./pages/Notifications/NotificationsPage";

export default function App() {
  const { isAuthenticated, logout } = useAuth();

  return (
    <BrowserRouter>
      <Navbar 
        isAuthenticated={isAuthenticated} 
        logout={logout} 
      />

      <main className="mainContent">
        <div className="container section">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/book/:id" element={<BookDetailsPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/profil" element={<ProfilePage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/user/:id" element={<UserProfilePage />} />
            <Route path="/edit-profile" element={<EditProfilePage />} />
            <Route path="/feed" element={<FeedPage />} />
            <Route path="/notifications" element={<NotificationsPage />} />
          </Routes>
        </div>
      </main>

      <Footer />
    </BrowserRouter>
  );
}