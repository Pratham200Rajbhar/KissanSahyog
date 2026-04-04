export type ThemeMode = "dark" | "light";

export const THEME_STORAGE_KEY = "kissan-theme-mode";
export const THEME_CHANGE_EVENT = "kissan-theme-change";

export function getStoredTheme(): ThemeMode | null {
  if (typeof window === "undefined") return null;
  const value = window.localStorage.getItem(THEME_STORAGE_KEY);
  return value === "light" || value === "dark" ? value : null;
}

export function getActiveTheme(): ThemeMode {
  if (typeof document === "undefined") return "dark";
  return document.documentElement.classList.contains("light") ? "light" : "dark";
}

export function applyTheme(theme: ThemeMode, persist = true) {
  if (typeof document === "undefined") return;

  const root = document.documentElement;
  root.classList.remove("light", "dark");
  root.classList.add(theme);

  if (persist && typeof window !== "undefined") {
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  }

  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent<ThemeMode>(THEME_CHANGE_EVENT, { detail: theme }));
  }
}

export function toggleThemeWithAnimation(currentTheme: ThemeMode) {
  const nextTheme: ThemeMode = currentTheme === "dark" ? "light" : "dark";

  if (typeof document === "undefined") return;

  const transitionDoc = document as Document & {
    startViewTransition?: (callback: () => void) => { finished: Promise<void> };
  };

  if (transitionDoc.startViewTransition) {
    transitionDoc.startViewTransition(() => applyTheme(nextTheme));
    return;
  }

  applyTheme(nextTheme);
}
