import { fmtNumber } from "@/lib/format";
import { IconArrowUp } from "../icons";

export interface BarItem {
  label: string;
  value: number;
  deltaPct?: number | null;
}

// Горизонтальные бары с градиентной заливкой
export function Bars({ data, accent = "#8b5cf6" }: { data: BarItem[]; accent?: string }) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <ul className="space-y-3">
      {data.map((d, i) => (
        <li key={i}>
          <div className="mb-1 flex items-center justify-between text-sm">
            <span className="text-muted">{d.label}</span>
            <span className="flex items-center gap-2">
              <span className="font-semibold text-fg">{fmtNumber(d.value)}</span>
              {d.deltaPct != null && d.deltaPct !== 0 && (
                <span
                  className={`flex items-center gap-0.5 text-xs ${
                    d.deltaPct > 0 ? "text-emerald-400" : "text-rose-400"
                  }`}
                >
                  <IconArrowUp
                    className={`h-3 w-3 ${d.deltaPct < 0 ? "rotate-180" : ""}`}
                  />
                  {Math.abs(d.deltaPct)}%
                </span>
              )}
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-ink-500">
            <div
              className="h-full rounded-full"
              style={{
                width: `${(d.value / max) * 100}%`,
                background: `linear-gradient(90deg, ${accent}, #22d3ee)`,
              }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}
