"use client";

import { useEffect, useState } from "react";
import { IconSun, IconMoon } from "./icons";

type Theme = "dark" | "light";

// Тумблер тёмная/светлая тема. Состояние пишется в data-theme на <html> и в localStorage.
export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    const saved = (document.documentElement.getAttribute("data-theme") as Theme) || "dark";
    setTheme(saved);
  }, []);

  const apply = (t: Theme) => {
    setTheme(t);
    if (t === "light") document.documentElement.setAttribute("data-theme", "light");
    else document.documentElement.removeAttribute("data-theme");
    try {
      localStorage.setItem("theme", t);
    } catch {}
  };

  const isLight = theme === "light";

  return (
    <button
      onClick={() => apply(isLight ? "dark" : "light")}
      className="flex w-full items-center justify-between rounded-xl border border-line bg-ink-600/50 px-3 py-2 text-sm text-muted transition-colors hover:text-fg"
      aria-label="Переключить тему оформления"
      title="Тёмная / светлая тема"
    >
      <span className="flex items-center gap-2">
        {isLight ? <IconSun className="h-4 w-4 text-amber-400" /> : <IconMoon className="h-4 w-4 text-brand-cyan" />}
        {isLight ? "Светлая тема" : "Тёмная тема"}
      </span>
      {/* Сам тумблер */}
      <span
        className={`relative h-5 w-9 rounded-full transition-colors ${
          isLight ? "bg-brand-gradient" : "bg-ink-500"
        }`}
      >
        <span
          className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all ${
            isLight ? "left-[18px]" : "left-0.5"
          }`}
        />
      </span>
    </button>
  );
}
