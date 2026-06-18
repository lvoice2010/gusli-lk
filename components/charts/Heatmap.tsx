"use client";

import { useState } from "react";

// Почасовая карта нагрузки: дни недели × часы (00–23). В ячейках — число звонков.
// Цвет от cyan (мало) к magenta (пик). Данные демонстрационные, детерминированные.
const DAYS = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];
const HOURS = Array.from({ length: 24 }, (_, i) => i);

// Период карты: текущая неделя / месяц / квартал. Профиль нагрузки тот же,
// меняется масштаб (≈ число недель в периоде) — пики растут пропорционально.
const RANGES = [
  { key: "week", label: "Неделя", scale: 1 },
  { key: "month", label: "Месяц", scale: 4.3 },
  { key: "quarter", label: "Квартал", scale: 13 },
] as const;
type RangeKey = (typeof RANGES)[number]["key"];

// Компактный формат для крупных значений: 1 320 → «1.3k»
function fmtCell(n: number): string {
  return n >= 1000 ? (n / 1000).toFixed(1).replace(".0", "") + "k" : String(n);
}

// Базовый профиль будня (звонков/час): пик в обед (~12) и вечерний всплеск (~19)
const WEEKDAY = [2, 2, 1, 1, 0, 0, 1, 13, 15, 55, 76, 92, 98, 92, 76, 55, 38, 28, 30, 45, 27, 22, 17, 12];
const DAY_MULT = [0.97, 1.05, 1.05, 0.97, 0.9, 0.52, 0.56];

function callsAt(day: number, hour: number): number {
  return Math.round(WEEKDAY[hour] * DAY_MULT[day]);
}

// Цветовая шкала как на референсе: teal → cyan → blue → indigo → purple → magenta
const STOPS: [number, [number, number, number]][] = [
  [0.0, [94, 234, 212]], // #5eead4 teal
  [0.16, [34, 211, 238]], // #22d3ee cyan
  [0.34, [56, 130, 246]], // #3882f6 blue
  [0.52, [99, 102, 241]], // #6366f1 indigo
  [0.7, [139, 92, 246]], // #8b5cf6 purple
  [0.85, [192, 38, 211]], // #c026d3 magenta
  [1.0, [219, 39, 119]], // #db2777 pink
];

function colorFor(t: number): string {
  for (let i = 1; i < STOPS.length; i++) {
    if (t <= STOPS[i][0]) {
      const [t0, c0] = STOPS[i - 1];
      const [t1, c1] = STOPS[i];
      const f = (t - t0) / (t1 - t0 || 1);
      const c = c0.map((v, k) => Math.round(v + (c1[k] - v) * f));
      return `rgb(${c[0]},${c[1]},${c[2]})`;
    }
  }
  const [, last] = STOPS[STOPS.length - 1];
  return `rgb(${last[0]},${last[1]},${last[2]})`;
}

const MAX = Math.max(...WEEKDAY.map((v) => v * Math.max(...DAY_MULT)));

export function Heatmap() {
  const [range, setRange] = useState<RangeKey>("week");
  const scale = RANGES.find((r) => r.key === range)!.scale;

  return (
    <div>
      {/* Селектор периода: текущая неделя / месяц / квартал */}
      <div className="mb-3 flex items-center justify-end">
        <div className="inline-flex items-center gap-1 rounded-xl border border-line bg-ink-700/70 p-1">
          {RANGES.map((r) => {
            const active = r.key === range;
            return (
              <button
                key={r.key}
                onClick={() => setRange(r.key)}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-all ${
                  active ? "bg-brand-gradient text-white shadow-glow" : "text-muted hover:text-fg"
                }`}
              >
                {r.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="overflow-x-auto">
      <div className="min-w-[760px]">
        {/* Часы */}
        <div className="flex">
          <div className="w-8 shrink-0" />
          <div className="flex flex-1 gap-1 pl-1">
            {HOURS.map((h) => (
              <div key={h} className="flex-1 text-center text-[10px] text-faint">
                {h < 10 ? `0${h}` : h}
              </div>
            ))}
          </div>
        </div>

        {/* Строки дней */}
        <div className="mt-1 space-y-1">
          {DAYS.map((d, di) => (
            <div key={d} className="flex items-center">
              <div className="w-8 shrink-0 text-xs text-faint">{d}</div>
              <div className="flex flex-1 gap-1 pl-1">
                {HOURS.map((h) => {
                  const base = callsAt(di, h);
                  const t = base / MAX; // цвет нормирован по профилю, не зависит от периода
                  const n = Math.round(base * scale); // число звонков за выбранный период
                  const empty = n <= 0;
                  const dark = t >= 0.35; // тёмная ячейка → белый текст
                  return (
                    <div
                      key={h}
                      title={`${d} ${h}:00 — ${n} звонков`}
                      className="flex h-7 flex-1 items-center justify-center rounded text-[11px] font-medium"
                      style={{
                        background: empty ? "rgb(var(--ink-500))" : colorFor(t),
                        color: empty ? "transparent" : dark ? "#fff" : "#0b1020",
                      }}
                    >
                      {empty ? "" : fmtCell(n)}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Легенда */}
        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-[11px] text-faint">
            Мало звонков
            <span
              className="h-2.5 w-28 rounded-full"
              style={{
                background:
                  "linear-gradient(90deg,#a5f3fc,#22d3ee,#3b82f6,#6366f1,#8b5cf6,#c026d3,#db2777)",
              }}
            />
            Пик
          </div>
          <div className="text-[11px] text-faint">
            в ячейках — звонков за {range === "week" ? "неделю" : range === "month" ? "месяц" : "квартал"} (тек.)
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}
