import { useEffect, useState } from "react";

export default function useTheme() {
  const [theme, setTheme] = useState("pink");

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    if (saved) setTheme(saved);
  }, []);

  useEffect(() => {
    localStorage.setItem("theme", theme);
  }, [theme]);

  return { theme, setTheme };
}
