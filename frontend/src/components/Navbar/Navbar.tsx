import { useState } from "react";
import { Link } from "react-router-dom";
import styles from "./Navbar.module.css";
import ThemeToggle from "../ThemeToggle/ThemeToggle";

interface Props {
  isAuthenticated: boolean;
  logout: () => void;
}

export default function Navbar({ isAuthenticated, logout }: Props) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className={styles.navbar}>
      {menuOpen && <div className={styles.overlay} onClick={() => setMenuOpen(false)} />}
      <Link to="/" className={styles.logo}>
        <img src="/cat.png" className={styles.icon} alt="logo" />
        Bokrecensioner
      </Link>

<button
  className={styles.hamburger}
  onClick={() => setMenuOpen(!menuOpen)}
>
  {menuOpen ? "✕" : "☰"}
</button>

<div className={`${styles.links} ${menuOpen ? styles.open : ""}`}>
  <Link to="/" onClick={() => setMenuOpen(false)}>
    Hem
  </Link>

  <Link to="/profil" onClick={() => setMenuOpen(false)}>
    Min profil
  </Link>

  <ThemeToggle />

  {!isAuthenticated && (
    <Link to="/login" onClick={() => setMenuOpen(false)}>
      Logga in
    </Link>
  )}

  {isAuthenticated && (
    <button
      onClick={() => {
        logout();
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