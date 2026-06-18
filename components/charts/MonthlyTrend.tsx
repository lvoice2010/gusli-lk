"use client";

import { useState } from "react";
import { fmtNumber } from "@/lib/format";
import type { TrendMonth } from "@/lib/mock";

// Плавный путь через точки (Catmull-Rom → Безье)
function smooth(pts: { x: number; y: number }[]): string {
  if (pts.length < 2) return pts.length ? `M ${pts[0].x} ${pts[0].y}` : "";
  let d = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] || p2;
    const c1x = p1.x + (p2.x - p0.x) / 6;
    const c1y = p1.y + (p2.y - p0.y) / 6;
    const c2x = p2.x - (p3.x - p1.x) / 6;
    const c2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${c1x} ${c1y}, ${c2x} ${c2y}, ${p2.x} ${p2.y}`;
  }
  return d;
}

export function MonthlyTrend({ points }: { points: TrendMonth[] }) {
  const [hover, setHover] = useState<number | null>(null);

  const W = 760;
  const H = 380;
  const pad = { t: 24, r: 20, b: 40, l: 52 };
  const innerW = W - pad.l - pad.r;
  const innerH = H - pad.t - pad.b;
  const max = Math.max(...points.map((p) => p.incoming), 1);
  const niceMax = Math.ceil(max / 500) * 500;
  const stepX = points.length > 1 ? innerW / (points.length - 1) : 0;
  const x = (i: number) => pad.l + i * stepX;
  const y = (v: number) => pad.t + innerH - (v / niceMax) * innerH;

  const incPts = points.map((p, i) => ({ x: x(i), y: y(p.incoming) }));
  const aiPts = points.map((p, i) => ({ x: x(i), y: y(p.ai) }));
  const yTicks = Array.from({ length: 5 }, (_, i) => (niceMax / 4) * i);

  return (
    <div className="relative" onMouseLeave={() => setHover(null)}>
      <svg viewBox={`0 0 ${W} ${H}`} className="block w-full" role="img" aria-label="Помесячная динамика">
        <defs>
          <linearGradient id="incArea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6366f1" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Сетка + подписи оси Y */}
        {yTicks.map((t, i) => (
          <g key={i}>
            <line x1={pad.l} x2={W - pad.r} y1={y(t)} y2={y(t)} stroke="rgb(var(--line))" strokeWidth="1" opacity="0.6" />
            <text x={pad.l - 10} y={y(t) + 4} textAnchor="end" className="fill-faint text-[12px]">
              {fmtNumber(t)}
            </text>
          </g>
        ))}

        {/* Область под входящими */}
        <path d={`${smooth(incPts)} L ${x(points.length - 1)} ${y(0)} L ${x(0)} ${y(0)} Z`} fill="url(#incArea)" />

        {/* Линии */}
        <path d={smooth(incPts)} fill="none" stroke="#6366f1" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />
        <path d={smooth(aiPts)} fill="none" stroke="#22d3ee" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />

        {/* Вертикальная направляющая при наведении */}
        {hover != null && (
          <line x1={x(hover)} x2={x(hover)} y1={pad.t} y2={pad.t + innerH} stroke="rgb(var(--line))" strokeWidth="1.5" />
        )}

        {/* Точки */}
        {points.map((p, i) => {
          const big = hover === i;
          return (
            <g key={i}>
              <circle cx={x(i)} cy={y(p.incoming)} r={big ? 5.5 : 3.5} fill="rgb(var(--ink-700))" stroke="#6366f1" strokeWidth="2.5" />
              <circle cx={x(i)} cy={y(p.ai)} r={big ? 5.5 : 3.5} fill="rgb(var(--ink-700))" stroke="#22d3ee" strokeWidth="2.5" />
              <text x={x(i)} y={H - 12} textAnchor="middle" className="fill-faint text-[11px]">
                {p.label}
              </text>
            </g>
          );
        })}

        {/* Прозрачные зоны наведения */}
        {points.map((p, i) => (
          <rect
            key={i}
            x={x(i) - stepX / 2}
            y={pad.t}
            width={stepX}
            height={innerH}
            fill="transparent"
            onMouseEnter={() => setHover(i)}
          />
        ))}
      </svg>

      {/* Тултип */}
      {hover != null && (
        <div
          className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full rounded-lg border border-line bg-ink-800 px-3 py-2 text-xs shadow-glow"
          style={{
            left: `${(x(hover) / W) * 100}%`,
            top: `${(Math.min(y(points[hover].incoming), y(points[hover].ai)) / H) * 100}%`,
            marginTop: -10,
          }}
        >
          <div className="mb-1 font-medium text-fg">{points[hover].label}</div>
          <div className="flex items-center gap-1.5 text-muted">
            <span className="h-2 w-2 rounded-full" style={{ background: "#6366f1" }} /> Принятых
            <span className="ml-auto pl-3 font-semibold text-fg">{fmtNumber(points[hover].incoming)}</span>
          </div>
          <div className="mt-0.5 flex items-center gap-1.5 text-muted">
            <span className="h-2 w-2 rounded-full bg-brand-cyan" /> Обработано ИИ
            <span className="ml-auto pl-3 font-semibold text-fg">{fmtNumber(points[hover].ai)}</span>
          </div>
        </div>
      )}
    </div>
  );
}
