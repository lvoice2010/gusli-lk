"use client";

import type { PeriodKey } from "@/lib/types";
import { IconCalendar } from "./icons";

const OPTIONS: { key: PeriodKey; label: string }[] = [
  { key: "today", label: "Сегодня" },
  { key: "yesterday", label: "Вчера" },
  { key: "week", label: "Неделя" },
  { key: "month", label: "Месяц" },
  { key: "custom", label: "Период" },
];

export function PeriodSwitcher({
  value,
  onChange,
}: {
  value: PeriodKey;
  onChange: (p: PeriodKey) => void;
}) {
  return (
    <div className="inline-flex items-center gap-1 rounded-xl border border-line bg-ink-700/70 p-1">
      {OPTIONS.map((o) => {
        const active = o.key === value;
        return (
          <button
            key={o.key}
            onClick={() => onChange(o.key)}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-all ${
              active
                ? "bg-brand-gradient text-white shadow-glow"
                : "text-muted hover:text-fg"
            }`}
          >
            {o.key === "custom" && <IconCalendar className="h-4 w-4" />}
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
