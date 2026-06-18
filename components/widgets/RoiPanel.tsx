"use client";

import { useState } from "react";
import { Roi } from "./Roi";
import { YEAR_STATS, BILLING, CLIENT } from "@/lib/mock";
import type { RoiData } from "@/lib/types";

type Period = "month" | "quarter" | "year";

// ROI со своим переключателем периода (текущий месяц / квартал / год),
// чтобы было видно, за какой срок считается экономия.
export function RoiPanel() {
  const [period, setPeriod] = useState<Period>("month");

  const data = YEAR_STATS["2026"];
  const slice = period === "month" ? data.slice(-1) : period === "quarter" ? data.slice(-3) : data;

  const aiClosedCount = slice.reduce((s, m) => s + m.aiHandled, 0);
  const totalSec = slice.reduce((s, m) => s + m.aiHandled * m.avgDialogSec, 0);
  const avgHandleSec = aiClosedCount ? Math.round(totalSec / aiClosedCount) : 0;
  const savedMinutes = Math.round(totalSec / 60);
  const savedMoney = Math.round((savedMinutes / 60) * CLIENT.operatorRatePerHour);
  const dialogCost = +((avgHandleSec / 60) * BILLING.ratePerMin).toFixed(1);

  const roi: RoiData = {
    aiClosedCount,
    avgHandleSec,
    savedMinutes,
    operatorRatePerHour: CLIENT.operatorRatePerHour,
    dialogCost,
    savedMoney,
  };

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
      <Roi data={roi} />
    </div>
  );
}
