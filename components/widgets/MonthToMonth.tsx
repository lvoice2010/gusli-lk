"use client";

import { useState } from "react";
import { fmtNumber } from "@/lib/format";
import { YEAR_STATS, type MonthStat } from "@/lib/mock";

// «Сегодня» в прототипе — 19 июня, поэтому MTD = первые 19 из 30 дней месяца.
const MTD_DAYS = 19;
const MONTH_DAYS = 30;

function mmss(sec: number) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s < 10 ? "0" : ""}${s}`;
}

// Масштабируем объёмные метрики месяца к доле прошедших дней (ставки и средние не трогаем)
function toMtd(m: MonthStat, frac: number): MonthStat {
  return {
    ...m,
    incoming: Math.round(m.incoming * frac),
    aiHandled: Math.round(m.aiHandled * frac),
    escalations: Math.round(m.escalations * frac),
  };
}

// Дельта-подпись: рост/падение со стрелкой; good — хорошо ли это
function Delta({ text, up, good }: { text: string; up: boolean; good: boolean }) {
  return (
    <span className={`flex items-center justify-end gap-1 text-xs ${good ? "text-emerald-400" : "text-rose-400"}`}>
      <span className={up ? "" : "rotate-180"}>↗</span>
      {text}
    </span>
  );
}

export function MonthToMonth() {
  const [mode, setMode] = useState<"closed" | "mtd">("closed");

  const y26 = YEAR_STATS["2026"];

  let current: MonthStat;
  let previous: MonthStat;
  let currentLabel: string;
  let previousLabel: string;
  let note: string;

  if (mode === "mtd") {
    // Текущий месяц на тек. дату vs прошлый месяц за те же даты (1–19)
    const frac = MTD_DAYS / MONTH_DAYS;
    current = y26[y26.length - 1]; // Июнь 2026, данные уже на тек. дату
    previous = toMtd(y26[y26.length - 2], frac); // Май 2026 за те же даты (1–19)
    currentLabel = `Июнь (1–${MTD_DAYS})`;
    previousLabel = `Май (1–${MTD_DAYS})`;
    note = `Сравнение текущего месяца за ${MTD_DAYS} дней с тем же окном предыдущего месяца (1–${MTD_DAYS} мая) — чтобы числа были сопоставимы.`;
  } else {
    // Последние завершённые месяцы — месяц к месяцу
    current = y26[y26.length - 2]; // Май
    previous = y26[y26.length - 3]; // Апрель
    currentLabel = "Май";
    previousLabel = "Апрель";
    note = "Сравнение последних завершённых месяцев — май к апрелю (текущий июнь ещё идёт).";
  }

  const pctDelta = (c: number, p: number) => {
    const d = p ? ((c - p) / p) * 100 : 0;
    return { text: `${d > 0 ? "+" : ""}${d.toFixed(1)}%`, up: d >= 0 };
  };

  const curMinutes = Math.round((current.incoming * current.avgDialogSec) / 60);
  const prevMinutes = Math.round((previous.incoming * previous.avgDialogSec) / 60);

  const rows = [
    { label: "Входящие", c: fmtNumber(current.incoming), d: pctDelta(current.incoming, previous.incoming), goodUp: true },
    { label: "Обработано ИИ", c: fmtNumber(current.aiHandled), d: pctDelta(current.aiHandled, previous.aiHandled), goodUp: true },
    { label: "Эскалаций", c: fmtNumber(current.escalations), d: pctDelta(current.escalations, previous.escalations), goodUp: false },
    {
      label: "Доля эскалаций",
      c: `${current.escalationRate.toFixed(1)}%`,
      d: {
        text: `${current.escalationRate - previous.escalationRate >= 0 ? "+" : ""}${(current.escalationRate - previous.escalationRate).toFixed(1)} п.п.`,
        up: current.escalationRate - previous.escalationRate >= 0,
      },
      goodUp: false,
    },
    {
      label: "Ср. время диалога",
      c: mmss(current.avgDialogSec),
      d: {
        text: `${current.avgDialogSec - previous.avgDialogSec >= 0 ? "+" : ""}${current.avgDialogSec - previous.avgDialogSec} сек`,
        up: current.avgDialogSec - previous.avgDialogSec >= 0,
      },
      goodUp: false,
    },
    {
      label: "Длительность разговоров, мин",
      c: fmtNumber(curMinutes),
      d: pctDelta(curMinutes, prevMinutes),
      goodUp: true,
    },
  ];

  const prevVals = [
    fmtNumber(previous.incoming),
    fmtNumber(previous.aiHandled),
    fmtNumber(previous.escalations),
    `${previous.escalationRate.toFixed(1)}%`,
    mmss(previous.avgDialogSec),
    fmtNumber(prevMinutes),
  ];

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <div className="inline-flex items-center gap-1 rounded-lg border border-line bg-ink-700/70 p-0.5 text-xs">
          {([["closed", "Закрытые"], ["mtd", "Текущий MTD"]] as const).map(([k, l]) => (
            <button
              key={k}
              onClick={() => setMode(k)}
              className={`rounded-md px-2.5 py-1 font-medium transition-colors ${
                mode === k ? "bg-brand-gradient text-white" : "text-muted hover:text-fg"
              }`}
            >
              {l}
            </button>
          ))}
        </div>
      </div>
      <p className="mb-3 text-xs text-faint">{note}</p>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-xs uppercase tracking-wide text-faint">
            <th className="pb-2 text-left font-medium">Показатель</th>
            <th className="pb-2 text-right font-medium">{currentLabel}</th>
            <th className="pb-2 text-right font-medium">{previousLabel}</th>
            <th className="pb-2 text-right font-medium">Δ</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={r.label} className="border-t border-line/50">
              <td className="py-2.5 text-muted">{r.label}</td>
              <td className="py-2.5 text-right font-semibold text-fg">{r.c}</td>
              <td className="py-2.5 text-right text-faint">{prevVals[i]}</td>
              <td className="py-2.5 text-right">
                <Delta text={r.d.text} up={r.d.up} good={r.d.up === r.goodUp} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
