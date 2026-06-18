import { deltaLabel } from "@/lib/format";
import { InfoTip } from "./ui/Tooltip";
import { IconArrowUp } from "./icons";

export function KpiCard({
  label,
  value,
  sub,
  current,
  previous,
  // higherIsBetter влияет только на цвет дельты (рост хорошо/плохо)
  higherIsBetter = true,
  hint,
  accent = false,
}: {
  label: string;
  value: string;
  sub?: string;
  current?: number;
  previous?: number;
  higherIsBetter?: boolean;
  hint?: string;
  accent?: boolean;
}) {
  const delta =
    current != null && previous != null ? deltaLabel(current, previous) : null;
  const good = delta ? (higherIsBetter ? delta.good : !delta.good) : false;

  return (
    <div
      className={`card !p-4 ${
        accent ? "ring-1 ring-brand-purple/40" : ""
      }`}
    >
      <div className="flex items-center gap-1.5">
        <span className="card-title">{label}</span>
        {hint && <InfoTip text={hint} />}
      </div>
      <div className="mt-2 flex items-end justify-between gap-2">
        <div>
          <div
            className={`whitespace-nowrap text-[22px] font-bold leading-none ${
              accent ? "gradient-text" : "text-fg"
            }`}
          >
            {value}
          </div>
          {sub && <div className="mt-1.5 text-xs text-faint">{sub}</div>}
        </div>
        {delta ? (
          <span
            className={`mb-0.5 flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-xs font-medium ${
              good
                ? "bg-emerald-500/10 text-emerald-400"
                : "bg-rose-500/10 text-rose-400"
            }`}
          >
            <IconArrowUp className={`h-3 w-3 ${delta.dir === "down" ? "rotate-180" : ""}`} />
            {delta.text}
          </span>
        ) : (
          current != null && previous != null && (
            <span className="mb-0.5 text-xs text-faint">без изменений</span>
          )
        )}
      </div>
    </div>
  );
}
