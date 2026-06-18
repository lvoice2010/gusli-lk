import type { TrendPoint } from "@/lib/types";

// Линейный график «Динамика обращений» с областью под линией.
// Две серии: всего обращений и закрыто ИИ.
export function LineTrend({ points }: { points: TrendPoint[] }) {
  const W = 640;
  const H = 220;
  const pad = { t: 16, r: 16, b: 28, l: 36 };
  const max = Math.max(...points.map((p) => p.total), 1);
  const niceMax = Math.ceil(max / 10) * 10;
  const innerW = W - pad.l - pad.r;
  const innerH = H - pad.t - pad.b;
  const stepX = points.length > 1 ? innerW / (points.length - 1) : 0;

  const x = (i: number) => pad.l + i * stepX;
  const y = (v: number) => pad.t + innerH - (v / niceMax) * innerH;

  const path = (key: "total" | "ai") =>
    points.map((p, i) => `${i === 0 ? "M" : "L"} ${x(i)} ${y(p[key])}`).join(" ");
  const area =
    `${path("total")} L ${x(points.length - 1)} ${pad.t + innerH} L ${x(0)} ${pad.t + innerH} Z`;

  const yTicks = [0, niceMax / 2, niceMax];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Динамика обращений">
      <defs>
        <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="lineStroke" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#8b5cf6" />
          <stop offset="100%" stopColor="#22d3ee" />
        </linearGradient>
      </defs>

      {yTicks.map((t, i) => (
        <g key={i}>
          <line x1={pad.l} x2={W - pad.r} y1={y(t)} y2={y(t)} stroke="#1c1c2a" strokeWidth="1" />
          <text x={pad.l - 8} y={y(t) + 4} textAnchor="end" className="fill-faint text-[10px]">
            {t}
          </text>
        </g>
      ))}

      <path d={area} fill="url(#areaFill)" />
      <path d={path("total")} fill="none" stroke="url(#lineStroke)" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
      <path d={path("ai")} fill="none" stroke="#3b82f6" strokeWidth="1.8" strokeDasharray="4 4" opacity="0.8" />

      {points.map((p, i) => (
        <g key={i}>
          <circle cx={x(i)} cy={y(p.total)} r="3" fill="#0b0b12" stroke="#22d3ee" strokeWidth="2" />
          <text x={x(i)} y={H - 8} textAnchor="middle" className="fill-faint text-[10px]">
            {p.label}
          </text>
        </g>
      ))}
    </svg>
  );
}
