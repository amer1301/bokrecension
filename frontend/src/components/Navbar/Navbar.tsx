import { useState, useEffect } from "react";
import styles from "./Navbar.module.css";
import ThemeToggle from "../ThemeToggle/ThemeToggle";
import { Link, useNavigate } from "react-router-dom";
import { getNotifications } from "../../api/notificationApi";
import { useAuth } from "../../context/AuthContext";

interface Props {
  isAuthenticated: boolean;
  logout: () => void;
}

export default function Navbar({ isAuthenticated, logout }: Props) {

  const [menuOpen, setMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);

  const navigate = useNavigate();
  const { token } = useAuth();

  /* =========================
     LOAD NOTIFICATIONS
  ========================= */

useEffect(() => {
  if (!token) return;

  const loadNotifications = async () => {

    try {
      const data = await getNotifications(token);

      setNotifications(data);

    } catch (err) {

      console.error("Could not load notifications");

    }

  };

  loadNotifications();

  const interval = setInterval(loadNotifications, 30000);

  return () => clearInterval(interval);

}, [isAuthenticated]);

  return (

    <nav className={styles.navbar}>

      {menuOpen && (
        <div
          className={styles.overlay}
          onClick={() => setMenuOpen(false)}
        />
      )}

      {/* LOGO */}

      <Link
        to="/"
        className={styles.logo}
        onClick={() => setMenuOpen(false)}
      >
        <img
          src="/cat.png"
          className={styles.icon}
          alt="logo"
        />

        Bokrecensioner
      </Link>

      {/* HAMBURGER */}

      <button
        className={styles.hamburger}
        onClick={() => setMenuOpen(!menuOpen)}
      >
        {menuOpen ? "✕" : "☰"}
      </button>

      {/* LINKS */}

      <div
        className={`${styles.links} ${
          menuOpen ? styles.open : ""
        }`}
      >

        {/* HOME */}

        <Link
          to="/"
          onClick={() => setMenuOpen(false)}
        >
          Hem
        </Link>

        {/* FEED */}

        {isAuthenticated && (
          <Link
            to="/feed"
            onClick={() => setMenuOpen(false)}
          >
            Feed
          </Link>
        )}

        {/* PROFILE */}

        {isAuthenticated && (
          <Link
            to="/profil"
            onClick={() => setMenuOpen(false)}
          >
            Min profil
          </Link>
        )}

        {/* NOTIFICATIONS */}

        {isAuthenticated && (
          <Link
            to="/notifications"
            onClick={() => setMenuOpen(false)}
          >
            🔔 {notifications.length}
          </Link>
        )}

        {/* THEME */}

        <ThemeToggle />

        {/* LOGIN */}

        {!isAuthenticated && (
          <Link
            to="/login"
            onClick={() => setMenuOpen(false)}
          >
            Logga in
          </Link>
        )}

        {/* LOGOUT */}

        {isAuthenticated && (
          <button
            onClick={() => {

              logout();

              navigate("/login");

              setMenuOpen(false);

            }}
            className={styles.logoutButton}
          >
            Logga ut
          </button>
        )}

      </div>

    </nav>
  );
}