"use client";

import { useEffect, useRef, useState } from "react";
import type { PeriodKey } from "@/lib/types";
import { IconCalendar } from "./icons";

const OPTIONS: { key: PeriodKey; label: string }[] = [
  { key: "today", label: "Сегодня" },
  { key: "yesterday", label: "Вчера" },
  { key: "week", label: "Неделя" },
  { key: "month", label: "Месяц" },
];

export type CustomRange = { from: string; to: string };

// Прототип: «сегодня» — 19 июня 2026, поэтому дефолтный диапазон — июнь по тек. дату
const DEFAULT_RANGE: CustomRange = { from: "2026-06-01", to: "2026-06-19" };
const MAX_DATE = "2026-06-19";

function fmtShort(iso: string): string {
  const [, m, d] = iso.split("-");
  return `${d}.${m}`;
}

export function PeriodSwitcher({
  value,
  onChange,
  customRange,
  onCustomRange,
}: {
  value: PeriodKey;
  onChange: (p: PeriodKey) => void;
  customRange?: CustomRange | null;
  onCustomRange?: (r: CustomRange) => void;
}) {
  const [open, setOpen] = useState(false);
  const [from, setFrom] = useState(customRange?.from ?? DEFAULT_RANGE.from);
  const [to, setTo] = useState(customRange?.to ?? DEFAULT_RANGE.to);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onEsc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onEsc);
    };
  }, [open]);

  const customActive = value === "custom";
  const valid = from <= to;
  const apply = () => {
    if (!valid) return;
    onCustomRange?.({ from, to });
    onChange("custom");
    setOpen(false);
  };

  return (
    <div ref={ref} className="relative inline-flex">
      <div className="inline-flex items-center gap-1 rounded-xl border border-line bg-ink-700/70 p-1">
        {OPTIONS.map((o) => {
          const active = o.key === value;
          return (
            <button
              key={o.key}
              onClick={() => {
                onChange(o.key);
                setOpen(false);
              }}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-all ${
                active ? "bg-brand-gradient text-white shadow-glow" : "text-muted hover:text-fg"
              }`}
            >
              {o.label}
            </button>
          );
        })}

        {/* Произвольный период — открывает календарь */}
        <button
          onClick={() => setOpen((v) => !v)}
          className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-all ${
            customActive ? "bg-brand-gradient text-white shadow-glow" : "text-muted hover:text-fg"
          }`}
        >
          <IconCalendar className="h-4 w-4" />
          {customActive && customRange ? `${fmtShort(customRange.from)}–${fmtShort(customRange.to)}` : "Период"}
        </button>
      </div>

      {/* Поповер выбора дат */}
      {open && (
        <div className="absolute right-0 top-full z-40 mt-2 w-72 rounded-xl border border-line bg-ink-800 p-4 shadow-glow">
          <div className="mb-3 text-sm font-semibold text-fg">Выберите период</div>
          <div className="flex items-end gap-2">
            <label className="flex-1 text-xs text-faint">
              С
              <input
                type="date"
                value={from}
                max={to || MAX_DATE}
                onChange={(e) => setFrom(e.target.value)}
                className="mt-1 w-full rounded-lg border border-line bg-ink-600/50 px-2.5 py-1.5 text-sm text-fg focus:border-brand-purple focus:outline-none"
              />
            </label>
            <label className="flex-1 text-xs text-faint">
              По
              <input
                type="date"
                value={to}
                min={from}
                max={MAX_DATE}
                onChange={(e) => setTo(e.target.value)}
                className="mt-1 w-full rounded-lg border border-line bg-ink-600/50 px-2.5 py-1.5 text-sm text-fg focus:border-brand-purple focus:outline-none"
              />
            </label>
          </div>
          {!valid && (
            <div className="mt-2 text-xs text-rose-400">«С» не может быть позже «По».</div>
          )}
          <div className="mt-3 flex justify-end gap-2">
            <button onClick={() => setOpen(false)} className="btn-ghost text-sm">
              Отмена
            </button>
            <button onClick={apply} disabled={!valid} className="btn-primary text-sm disabled:opacity-50">
              Применить
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
