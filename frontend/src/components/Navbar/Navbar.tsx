import { useState } from "react";
import styles from "./Navbar.module.css";
import ThemeToggle from "../ThemeToggle/ThemeToggle";
import { Link, useNavigate } from "react-router-dom";

interface Props {
  isAuthenticated: boolean;
  logout: () => void;
}

export default function Navbar({ isAuthenticated, logout }: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
const navigate = useNavigate();
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