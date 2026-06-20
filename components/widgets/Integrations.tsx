"use client";

import { useState } from "react";
import { fmtNumber } from "@/lib/format";
import { IconCheck } from "../icons";
import { YEAR_STATS } from "@/lib/mock";
import type { IntegrationStatus } from "@/lib/types";

type Period = "month" | "quarter" | "year";

// Статус интеграций со своим переключателем периода (как в ROI): текущий месяц / квартал / год.
// Число действий (напр. броней) считается по срезу YEAR_STATS, независимо от верхнего периода.
export function IntegrationsPanel() {
  const [period, setPeriod] = useState<Period>("month");

  const data = YEAR_STATS["2026"];
  const slice = period === "month" ? data.slice(-1) : period === "quarter" ? data.slice(-3) : data;
  const incoming = slice.reduce((s, m) => s + m.incoming, 0);
  const bookings = Math.round(incoming * 0.34); // доля обращений, завершившихся бронью

  const items: IntegrationStatus[] = [
    { name: "Restoplace", system: "Бронирование", connected: true, actionLabel: "броней создано", actions: bookings },
    { name: "Bitrix24", system: "CRM", connected: false, actionLabel: "карточек создано", actions: 0 },
    { name: "YClients", system: "Записи", connected: false, actionLabel: "записей создано", actions: 0 },
    { name: "amoCRM", system: "CRM", connected: false, actionLabel: "сделок создано", actions: 0 },
  ];

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <div className="inline-flex items-center gap-1 rounded-xl border border-line bg-ink-700/70 p-1 text-sm">
          {([
            ["month", "Месяц"],
            ["quarter", "Квартал"],
            ["year", "Год"],
          ] as [Period, string][]).map(([k, l]) => (
            <button
              key={k}
              onClick={() => setPeriod(k)}
              className={`rounded-lg px-3 py-1.5 font-medium transition-colors ${
                period === k ? "bg-brand-gradient text-white" : "text-muted hover:text-fg"
              }`}
            >
              {l}
              {k === "month" ? " (тек.)" : k === "year" ? " (YTD)" : ""}
            </button>
          ))}
        </div>
      </div>
      <Integrations items={items} />
    </div>
  );
}

// Лента последних действий ассистента в Restoplace (демо)
const RECENT_ACTIONS: { time: string; type: string; text: string; tone: "create" | "move" | "cancel" | "read" }[] = [
  { time: "14:32", type: "Бронь", text: "4 гостя, сегодня 19:00 · стол 12", tone: "create" },
  { time: "13:58", type: "Перенос", text: "бронь Иванова: 20:00 → 21:00", tone: "move" },
  { time: "12:10", type: "Отмена", text: "бронь на 2 гостей · стол 7", tone: "cancel" },
  { time: "11:47", type: "Бронь", text: "2 гостя, завтра 13:30", tone: "create" },
  { time: "10:05", type: "Проверка", text: "наличие столов на пятницу", tone: "read" },
];

const TONE: Record<string, string> = {
  create: "border-emerald-500/30 text-emerald-400",
  move: "border-brand-cyan/30 text-brand-cyan",
  cancel: "border-rose-500/30 text-rose-400",
  read: "border-line text-faint",
};

export function Integrations({ items }: { items: IntegrationStatus[] }) {
  const connected = items.filter((i) => i.connected);

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        {connected.map((it) => (
          <div
            key={it.name}
            className="rounded-xl border border-emerald-500/25 bg-emerald-500/[0.06] p-4"
          >
            <div className="flex items-center justify-between">
              <span className="font-semibold text-fg">{it.name}</span>
              <span className="pill border-emerald-500/30 text-emerald-400">
                <IconCheck className="h-3 w-3" /> Подключено
              </span>
            </div>
            <div className="mt-3 flex items-end gap-2">
              <span className="text-2xl font-bold text-fg">{fmtNumber(it.actions)}</span>
              <span className="pb-1 text-xs text-muted">{it.actionLabel}</span>
            </div>
            <div className="mt-1 text-[11px] text-faint">{it.system}</div>
          </div>
        ))}
      </div>

      {connected.length > 0 && (
        <div>
          <div className="mb-2.5 text-xs font-medium uppercase tracking-wide text-faint">
            Последние действия ассистента
          </div>
          <ul className="space-y-2">
            {RECENT_ACTIONS.map((a, i) => (
              <li key={i} className="flex items-center gap-2.5 text-sm">
                <span className="w-10 shrink-0 tabular-nums text-faint">{a.time}</span>
                <span className={`pill shrink-0 ${TONE[a.tone]}`}>{a.type}</span>
                <span className="min-w-0 flex-1 truncate text-muted">{a.text}</span>
                <IconCheck className="h-3.5 w-3.5 shrink-0 text-emerald-400" />
              </li>
            ))}
          </ul>
          <div className="mt-2 text-[11px] text-faint">Последние операции в Restoplace.</div>
        </div>
      )}
    </div>
  );
}
