"use client";

import { IconInfo } from "../icons";

// Тултип-определение для метрик: «что именно считается».
// Реализован на CSS-hover/focus, доступен с клавиатуры.
export function InfoTip({ text }: { text: string }) {
  return (
    <span className="group/tip relative inline-flex">
      <button
        type="button"
        aria-label="Определение метрики"
        className="text-faint transition-colors hover:text-brand-cyan focus:text-brand-cyan focus:outline-none"
      >
        <IconInfo />
      </button>
      <span
        role="tooltip"
        className="pointer-events-none absolute bottom-full left-1/2 z-30 mb-2 w-60 -translate-x-1/2 rounded-lg border border-line bg-ink-800 px-3 py-2 text-xs leading-relaxed text-muted opacity-0 shadow-glow transition-opacity duration-150 group-hover/tip:opacity-100 group-focus-within/tip:opacity-100"
      >
        {text}
      </span>
    </span>
  );
}
