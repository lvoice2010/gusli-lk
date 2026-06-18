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

export function Integrations({ items }: { items: IntegrationStatus[] }) {
  const connected = items.filter((i) => i.connected);
  const available = items.filter((i) => !i.connected);

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

      {available.length > 0 && (
        <div>
          <div className="mb-2 text-xs font-medium uppercase tracking-wide text-faint">
            Доступно для подключения
          </div>
          <div className="flex flex-wrap gap-2">
            {available.map((it) => (
              <span
                key={it.name}
                className="pill border-dashed text-faint"
                title={`Появится после подключения интеграции «${it.name}»`}
              >
                <span className="h-2 w-2 rounded-full bg-faint/50" />
                {it.name} · {it.system}
              </span>
            ))}
          </div>
          <p className="mt-2 text-xs text-faint">
            Действия в этих системах появятся в статистике после подключения интеграции.
          </p>
        </div>
      )}
    </div>
  );
}
