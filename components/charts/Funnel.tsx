import { fmtNumber, fmtPercent } from "@/lib/format";
import { InfoTip } from "../ui/Tooltip";
import type { FunnelStep } from "@/lib/types";

export function Funnel({ steps }: { steps: FunnelStep[] }) {
  const first = steps[0]?.value || 1;
  return (
    <div className="space-y-2.5">
      {steps.map((s, i) => {
        const widthPct = Math.max((s.value / first) * 100, 8);
        const ofTotal = (s.value / first) * 100;
        const bg =
          s.tone === "good"
            ? "linear-gradient(90deg, #10b981, #34d399)"
            : s.tone === "bad"
              ? "linear-gradient(90deg, #f43f5e, #fb7185)"
              : `linear-gradient(90deg, rgba(139,92,246,${0.95 - i * 0.16}), rgba(34,211,238,${0.7 - i * 0.12}))`;
        const valColor =
          s.tone === "good" ? "text-emerald-400" : s.tone === "bad" ? "text-rose-400" : "text-fg";
        return (
          <div key={i}>
            {s.divider && (
              <div className="mb-2.5 mt-3 flex items-center gap-2 text-[10px] uppercase tracking-wide text-faint">
                <span className="h-px flex-1 bg-line" /> вне воронки <span className="h-px flex-1 bg-line" />
              </div>
            )}
            <div className="mb-1 flex items-center justify-between text-sm">
              <span className="flex items-center gap-1.5 text-muted">
                {s.label}
                <InfoTip text={s.def} />
              </span>
              <span className="flex items-center gap-2">
                <span className={`font-semibold ${valColor}`}>{fmtNumber(s.value)}</span>
                <span className="text-xs text-faint">{fmtPercent(ofTotal)} от обращений</span>
              </span>
            </div>
            <div className="relative h-9">
              <div className="h-full rounded-lg" style={{ width: `${widthPct}%`, background: bg }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
