"use client";

import { useEffect, useRef, useState } from "react";
import { IconInfo } from "../icons";

// Подсказка к метрике: «что именно считается».
// Кликабельна (закрепляется по клику), показывается и при наведении/фокусе.
// Закрывается кликом вне и по Esc. Доступна с клавиатуры.
export function InfoTip({ text, placement = "top" }: { text: string; placement?: "top" | "bottom" }) {
  const [open, setOpen] = useState(false);
  const [hover, setHover] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);
  const show = open || hover;

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onEsc);
    };
  }, [open]);

  return (
    <span
      ref={ref}
      className="relative inline-flex"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <button
        type="button"
        aria-label="Что считается"
        aria-expanded={open}
        onClick={(e) => {
          e.stopPropagation();
          setOpen((o) => !o);
        }}
        className={`transition-colors hover:text-brand-cyan focus:text-brand-cyan focus:outline-none ${
          show ? "text-brand-cyan" : "text-faint"
        }`}
      >
        <IconInfo />
      </button>
      <span
        role="tooltip"
        className={`absolute left-1/2 z-30 w-60 -translate-x-1/2 rounded-lg border border-line bg-ink-800 px-3 py-2 text-left text-xs font-normal leading-relaxed text-muted shadow-glow transition-opacity duration-150 ${
          placement === "bottom" ? "top-full mt-2" : "bottom-full mb-2"
        } ${show ? "opacity-100" : "pointer-events-none opacity-0"}`}
      >
        {text}
      </span>
    </span>
  );
}
