"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

export type Theme = "light" | "dark";

const STORAGE_KEY = "itzsa-theme";

type ThemeContextValue = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  ready: boolean;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

function readDomTheme(): Theme {
  if (typeof document === "undefined") return "dark";
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

/**
 * Instant theme swap + lightweight L→R teal scan (no View Transition snapshot).
 * VT was capturing the whole page (heavy on /table) and felt like a load.
 */
function runThemeScan() {
  if (prefersReducedMotion()) return;

  const existing = document.querySelector(".theme-scan-beam");
  existing?.remove();

  const beam = document.createElement("div");
  beam.className = "theme-scan-beam";
  beam.setAttribute("aria-hidden", "true");
  document.body.appendChild(beam);

  // Next frame so the browser paints the beam before animating
  requestAnimationFrame(() => {
    beam.classList.add("theme-scan-beam--run");
  });

  const done = () => beam.remove();
  beam.addEventListener("animationend", done, { once: true });
  // Safety if animationend is skipped
  window.setTimeout(done, 500);
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(readDomTheme);
  const [ready, setReady] = useState(false);
  const busy = useRef(false);

  useEffect(() => {
    setThemeState(readDomTheme());
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

    // Unlock quickly so rapid toggles stay responsive
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
