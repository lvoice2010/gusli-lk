"use client";

import { useState } from "react";
import { fmtNumber } from "@/lib/format";
import { YEAR_STATS, MONTHS_RU, type MonthStat } from "@/lib/mock";
import { IconSparkle } from "@/components/icons";

function mmss(sec: number) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s < 10 ? "0" : ""}${s}`;
}

type Year = "2026" | "2025";

const ROWS: { label: string; get: (m: MonthStat) => string; isCurrentYearOnly?: boolean }[] = [
  { label: "Входящие диалогов", get: (m) => fmtNumber(m.incoming) },
  { label: "Обработано ИИ", get: (m) => fmtNumber(m.aiHandled) },
  { label: "Эскалаций", get: (m) => fmtNumber(m.escalations) },
  { label: "Доля эскалаций", get: (m) => `${m.escalationRate.toFixed(1)}%` },
  { label: "Среднее время ответа", get: (m) => `${m.avgAnswerSec.toFixed(1)} сек` },
  { label: "Среднее время диалога", get: (m) => mmss(m.avgDialogSec) },
  {
    label: "Длительность разговоров, мин",
    get: (m) => fmtNumber(Math.round((m.incoming * m.avgDialogSec) / 60)),
  },
];

export function YearTable() {
  const [year, setYear] = useState<Year>("2026");
  const data = YEAR_STATS[year];
  const byMonth = new Map(data.map((m) => [m.label, m]));
  const lastFilled = data.length; // сколько месяцев заполнено
  const currentMonthLabel = year === "2026" ? data[data.length - 1]?.label : null;

  const totalDialogs = data.reduce((s, m) => s + m.incoming, 0);
  const totalAi = data.reduce((s, m) => s + m.aiHandled, 0);
  const aiShare = totalDialogs ? Math.round((totalAi / totalDialogs) * 100) : 0;

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-[15px] font-semibold text-fg">Годовой отчёт по месяцам</h3>
        <div className="inline-flex items-center gap-1 rounded-lg border border-line bg-ink-700/70 p-0.5 text-xs">
          {(["2026", "2025"] as Year[]).map((y) => (
            <button
              key={y}
              onClick={() => setYear(y)}
              className={`rounded-md px-2.5 py-1 font-medium transition-colors ${
                year === y ? "bg-brand-gradient text-white" : "text-muted hover:text-fg"
              }`}
            >
              {y}
              {y === "2026" ? " тек." : ""}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[820px] text-sm">
          <thead>
            <tr className="text-xs uppercase tracking-wide text-faint">
              <th className="pb-2 pr-3 text-left font-medium">Показатель</th>
              {MONTHS_RU.map((m) => (
                <th
                  key={m}
                  title={m === currentMonthLabel ? "Текущий месяц — данные на сегодняшнюю дату, не завершён" : undefined}
                  className={`pb-2 text-right font-medium ${m === currentMonthLabel ? "text-emerald-400" : ""}`}
                >
                  {m}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ROWS.map((row) => (
              <tr key={row.label} className="border-t border-line/50">
                <td className="whitespace-nowrap py-2.5 pr-3 text-muted">{row.label}</td>
                {MONTHS_RU.map((m) => {
                  const stat = byMonth.get(m);
                  const isCurrent = m === currentMonthLabel;
                  return (
                    <td
                      key={m}
                      className={`py-2.5 text-right ${
                        !stat ? "text-faint" : isCurrent ? "font-semibold text-emerald-400" : "text-fg"
                      }`}
                    >
                      {stat ? row.get(stat) : "—"}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {year === "2026" && currentMonthLabel && (
        <div className="mt-2 flex items-center gap-1.5 text-[11px] text-faint">
          <span className="h-2 w-2 rounded-full bg-emerald-400" />
          {currentMonthLabel} — текущий месяц, данные на сегодняшнюю дату (месяц ещё не завершён)
        </div>
      )}

      <div className="mt-4 rounded-xl border border-brand-purple/25 bg-brand-soft p-4">
        <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-brand-purple">
          <IconSparkle className="h-4 w-4" /> Вывод по {year} году
          <span className="rounded bg-ink-600/40 px-1.5 py-0.5 text-[10px] text-faint">
            {year === "2026" ? `тек. · ${lastFilled} мес` : "12 мес"}
          </span>
        </div>
        <p className="mt-1.5 text-sm leading-relaxed text-muted">
          За {year === "2026" ? `первые ${lastFilled} месяцев` : "год"} обработано{" "}
          <span className="font-semibold text-fg">{fmtNumber(totalDialogs)}</span> диалогов. ИИ
          закрывает <span className="font-semibold text-fg">{aiShare}%</span> запросов
          самостоятельно — основная часть нагрузки снимается с операторов на первой линии.
        </p>
      </div>
    </div>
  );
}
