"use client";

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

export type Theme = "light" | "dark";

const STORAGE_KEY = "itzsa-theme";

/** Must match `<html className="… dark">` default in root layout for SSR. */
const SSR_THEME: Theme = "dark";

type ThemeContextValue = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  ready: boolean;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

function readDomTheme(): Theme {
  if (typeof document === "undefined") return SSR_THEME;
  return document.documentElement.classList.contains("light")
    ? "light"
    : "dark";
}

function applyThemeClass(theme: Theme) {
  const root = document.documentElement;
  root.classList.toggle("dark", theme === "dark");
  root.classList.toggle("light", theme === "light");
  root.style.colorScheme = theme;
}

function persistTheme(theme: Theme) {
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    /* ignore */
  }
}

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function runThemeScan() {
  if (prefersReducedMotion()) return;

  const existing = document.querySelector(".theme-scan-beam");
  existing?.remove();

  const beam = document.createElement("div");
  beam.className = "theme-scan-beam";
  beam.setAttribute("aria-hidden", "true");
  document.body.appendChild(beam);

  requestAnimationFrame(() => {
    beam.classList.add("theme-scan-beam--run");
  });

  const done = () => beam.remove();
  beam.addEventListener("animationend", done, { once: true });
  window.setTimeout(done, 500);
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  // Fixed SSR initial state — never read localStorage/DOM during render
  const [theme, setThemeState] = useState<Theme>(SSR_THEME);
  const [ready, setReady] = useState(false);
  const busy = useRef(false);

  useEffect(() => {
    const next = readDomTheme();
    setThemeState(next);
    setReady(true);
  }, []);

  const changeTheme = useCallback((next: Theme) => {
    if (busy.current) return;
    const current = readDomTheme();
    if (next === current) {
      setThemeState(next);
      return;
    }

    busy.current = true;
    setThemeState(next);
    applyThemeClass(next);
    persistTheme(next);
    runThemeScan();

    window.setTimeout(() => {
      busy.current = false;
    }, 320);
  }, []);

  const setTheme = useCallback(
    (next: Theme) => {
      changeTheme(next);
    },
    [changeTheme],
  );

  const toggleTheme = useCallback(() => {
    changeTheme(readDomTheme() === "dark" ? "light" : "dark");
  }, [changeTheme]);

  const value = useMemo(
    () => ({ theme, setTheme, toggleTheme, ready }),
    [theme, setTheme, toggleTheme, ready],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return ctx;
}
