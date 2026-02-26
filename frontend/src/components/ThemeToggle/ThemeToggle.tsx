import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    if (saved) {
      setTheme(saved);
      document.documentElement.setAttribute(
        "data-theme",
        saved
      );
    }
  }, []);

  const toggleTheme = () => {
    const newTheme =
      theme === "light" ? "dark" : "light";

    setTheme(newTheme);
    document.documentElement.setAttribute(
      "data-theme",
      newTheme
    );

    localStorage.setItem("theme", newTheme);
  };

  return (
    <button className="button" onClick={toggleTheme}>
  {theme === "light" ? "Dark mode" : "Light mode"}
</button>
  );
}