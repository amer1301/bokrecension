import { Link } from "react-router-dom";
import styles from "./Navbar.module.css";
import cuteIcon from "../../assets/cat.png";

interface Props {
  isAuthenticated: boolean;
  logout: () => void;
}

export default function Navbar({ isAuthenticated, logout }: Props) {
  return (
    <nav className={styles.navbar}>
      <div className={styles.logo}>
  <img src={cuteIcon} alt="Cute icon" className={styles.icon} />
  Bokrecensioner
</div>

      <div className={styles.links}>
        <Link to="/">Hem</Link>
        <Link to="/profil">Min profil</Link>

        {!isAuthenticated && <Link to="/login">Logga in</Link>}

        {isAuthenticated && (
          <button onClick={logout} className={styles.logoutButton}>
            Logga ut
          </button>
        )}
      </div>
    </nav>
  );
}