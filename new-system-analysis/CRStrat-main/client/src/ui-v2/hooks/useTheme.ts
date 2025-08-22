import { useEffect, useState } from "react";

type Theme = "light" | "dark";

const KEY = "ui-v2-theme";

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem(KEY) as Theme | null;
    if (saved) return saved;
    const prefersDark = window.matchMedia?.("(prefers-color-scheme: dark)").matches;
    return prefersDark ? "dark" : "light";
  });

  useEffect(() => {
    try { localStorage.setItem(KEY, theme); } catch {}
  }, [theme]);

  const toggle = () => setTheme(t => (t === "dark" ? "light" : "dark"));
  const set = (t: Theme) => setTheme(t);
  return { theme, toggle, set };
}