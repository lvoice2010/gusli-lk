import { fmtNumber, fmtPercent } from "@/lib/format";
import type { ReportData } from "@/lib/types";

export function Escalation({ data }: { data: ReportData["escalation"] }) {
  const total = data.aiClosed + data.escalated || 1;
  const aiPct = (data.aiClosed / total) * 100;
  const escPct = (data.escalated / total) * 100;
  const maxReason = Math.max(...data.reasons.map((r) => r.count), 1);

  return (
    <div>
      {/* Сплит-бар ИИ vs оператор */}
      <div className="flex h-14 overflow-hidden rounded-xl border border-line">
        <div
          className="flex items-center justify-center bg-gradient-to-r from-brand-purple to-brand-indigo text-2xl font-bold text-white"
          style={{ width: `${aiPct}%` }}
        >
          {Math.round(aiPct)}%
        </div>
        <div
          className="flex items-center justify-center bg-ink-500 text-2xl font-bold text-amber-300"
          style={{ width: `${escPct}%` }}
        >
          {escPct >= 8 ? `${Math.round(escPct)}%` : ""}
        </div>
      </div>
      <div className="mt-2.5 flex justify-between text-sm">
        <span className="flex items-center gap-1.5 text-muted">
          <span className="h-2.5 w-2.5 rounded-sm bg-brand-purple" /> Закрыл ИИ ·{" "}
          <span className="text-base font-bold text-fg">{fmtNumber(data.aiClosed)}</span>
        </span>
        <span className="flex items-center gap-1.5 text-muted">
          <span className="h-2.5 w-2.5 rounded-sm bg-amber-300" /> Передано оператору ·{" "}
          <span className="text-base font-bold text-fg">{fmtNumber(data.escalated)}</span>
        </span>
      </div>

      {/* Причины перевода */}
      <div className="mt-5">
        <div className="mb-2.5 text-xs font-medium uppercase tracking-wide text-faint">
          Причины перевода на оператора
        </div>
        <ul className="space-y-2.5">
          {data.reasons.map((r, i) => (
            <li key={i} className="flex items-center gap-3 text-sm">
              <span className="w-44 shrink-0 text-muted">{r.label}</span>
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-ink-500">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-amber-400/80 to-amber-300"
                  style={{ width: `${(r.count / maxReason) * 100}%` }}
                />
              </div>
              <span className="w-8 text-right font-semibold text-fg">{r.count}</span>
              <span className="w-10 text-right text-xs text-faint">
                {fmtPercent((r.count / data.escalated) * 100)}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
