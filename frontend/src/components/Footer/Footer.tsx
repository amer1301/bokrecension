import styles from "./Footer.module.css";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <a 
        href="https://www.flaticon.com/free-icons/cute" 
        title="cute icons"
        target="_blank"
        rel="noopener noreferrer"
      >
        Cute icons created by Freepik - Flaticon
      </a>
      <p>© Amanda Persdotter 2026</p>
    </footer>
  );
}