"use client";

import { useEffect, useState } from "react";

export const THEME_KEY = "rtr:theme";
export const themes = [
  { id: "dark", label: "Dark" },
  { id: "light", label: "Light" },
  { id: "cb", label: "Colour-blind" },
] as const;
type Theme = (typeof themes)[number]["id"];

/** Runs in <head> before paint so the saved theme never flashes. */
export const themeBootScript = `try{var t=localStorage.getItem("${THEME_KEY}");if(t==="light"||t==="cb")document.documentElement.dataset.theme=t}catch(e){}`;

/** `compact` is a round icon button (header); otherwise a labelled dropdown (mobile menu). Both use a native select, so keyboard and screen readers just work. */
export function ThemeSwitch({ className = "", compact = false }: { className?: string; compact?: boolean }) {
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    const t = document.documentElement.dataset.theme;
    if (t === "light" || t === "cb") setTheme(t);
  }, []);

  function choose(t: Theme) {
    setTheme(t);
    if (t === "dark") delete document.documentElement.dataset.theme;
    else document.documentElement.dataset.theme = t;
    try { localStorage.setItem(THEME_KEY, t); } catch {}
  }

  const icon = (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
      <circle cx="8" cy="8" r="6.25" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path d="M8 1.75a6.25 6.25 0 0 1 0 12.5z" fill="currentColor" />
    </svg>
  );

  if (compact) {
    const current = themes.find((t) => t.id === theme)?.label;
    return (
      <span
        className={`relative grid h-9 w-9 place-items-center rounded-full border border-line text-muted transition-colors focus-within:border-ink focus-within:text-ink hover:border-ink/40 hover:text-ink ${className}`}
        title={`Theme: ${current}`}
      >
        {icon}
        <select
          value={theme}
          onChange={(e) => choose(e.target.value as Theme)}
          className="absolute inset-0 cursor-pointer appearance-none rounded-full opacity-0"
          aria-label={`Theme (currently ${current})`}
        >
          {themes.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
        </select>
      </span>
    );
  }

  return (
    <label className={`flex items-center gap-2 text-sm text-muted ${className}`}>
      {icon}
      <span>Theme</span>
      <select
        value={theme}
        onChange={(e) => choose(e.target.value as Theme)}
        className="cursor-pointer rounded-full border border-line bg-surface px-2.5 py-1.5 text-sm text-ink"
        aria-label="Theme"
      >
        {themes.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
      </select>
    </label>
  );
}
