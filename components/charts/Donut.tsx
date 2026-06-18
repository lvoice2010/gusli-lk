import { fmtNumber } from "@/lib/format";

export interface DonutSlice {
  label: string;
  value: number;
  color: string;
}

export function Donut({
  data,
  centerLabel,
  centerValue,
}: {
  data: DonutSlice[];
  centerLabel?: string;
  centerValue?: string;
}) {
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  const R = 60;
  const C = 2 * Math.PI * R;
  let offset = 0;

  return (
    <div className="flex flex-wrap items-center gap-6">
      <div className="relative h-[150px] w-[150px] shrink-0">
        <svg viewBox="0 0 150 150" className="h-full w-full -rotate-90">
          <circle cx="75" cy="75" r={R} fill="none" stroke="#1a1a27" strokeWidth="16" />
          {data.map((d, i) => {
            const frac = d.value / total;
            const dash = frac * C;
            const seg = (
              <circle
                key={i}
                cx="75"
                cy="75"
                r={R}
                fill="none"
                stroke={d.color}
                strokeWidth="16"
                strokeDasharray={`${dash} ${C - dash}`}
                strokeDashoffset={-offset}
                strokeLinecap="butt"
              />
            );
            offset += dash;
            return seg;
          })}
        </svg>
        <div className="absolute inset-0 grid place-items-center text-center">
          <div>
            <div className="text-xl font-bold text-fg">{centerValue}</div>
            <div className="text-[11px] text-faint">{centerLabel}</div>
          </div>
        </div>
      </div>
      <ul className="flex-1 space-y-2 text-sm">
        {data.map((d, i) => (
          <li key={i} className="flex items-center gap-2.5">
            <span className="h-2.5 w-2.5 shrink-0 rounded-sm" style={{ background: d.color }} />
            <span className="flex-1 text-muted">{d.label}</span>
            <span className="font-semibold text-fg">{fmtNumber(d.value)}</span>
            <span className="w-10 text-right text-xs text-faint">
              {Math.round((d.value / total) * 100)}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
