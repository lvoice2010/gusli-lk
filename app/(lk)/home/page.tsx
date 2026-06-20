"use client";

import { useState } from "react";
import Link from "next/link";
import { Topbar } from "@/components/Topbar";
import { QuarterReportDemo } from "@/components/widgets/QuarterReportDemo";
import { ConnectModal } from "@/components/widgets/ConnectModal";
import { PulseDot } from "@/components/PulseDot";
import { CONNECTED_ASSISTANTS, CLIENT } from "@/lib/mock";
import { fmtNumber, fmtDuration } from "@/lib/format";
import {
  IconWave,
  IconClock,
  IconArrowRight,
  IconPhone,
  IconMail,
  IconAssistant,
} from "@/components/icons";

// ── Рекомендации ──
const RECS = [
  {
    label: "Исходящая линия",
    title: "Подтверждение бронирования",
    desc: "Ассистент сам обзвонит гостей и подтвердит брони — снизит неявки и пустые столы.",
    cta: "Оставить заявку",
    Icon: IconPhone,
    accent: "#6366f1",
  },
  {
    label: "Подходит вашей отрасли",
    title: "Ежеквартальный ИИ-отчёт",
    desc: "Карта проблем по обращениям и рекомендации с прогнозом роста продаж на 15–25%.",
    cta: "Попробовать",
    Icon: IconWave,
    accent: "#22d3ee",
    demo: true,
  },
];

export default function HomePage() {
  const [demo, setDemo] = useState(false);
  const [connect, setConnect] = useState<string | null>(null);
  return (
    <>
      <Topbar title="Главная" subtitle={CLIENT.company} />

      <div className="space-y-8 p-6">
        {/* ── Рекомендации ── */}
        <section>
          <h2 className="mb-3 text-lg font-semibold text-fg">Рекомендации</h2>
          <div className="grid gap-3 md:grid-cols-2">
            {RECS.map((r) => (
              <div key={r.title} className="card flex flex-col">
                <div className="flex items-start justify-between">
                  <span className="text-[11px] font-semibold uppercase tracking-wide text-faint">
                    {r.label}
                  </span>
                  <span
                    className="grid h-11 w-11 place-items-center rounded-xl text-white"
                    style={{ background: `linear-gradient(135deg, ${r.accent}, #22d3ee)` }}
                  >
                    <r.Icon className="h-6 w-6" />
                  </span>
                </div>
                <h3 className="mt-2 font-semibold text-fg">{r.title}</h3>
                <p className="mt-1 flex-1 text-sm leading-relaxed text-muted">{r.desc}</p>
                <div className="mt-4 flex items-center gap-2">
                  <button onClick={() => setConnect(r.title)} className="btn-primary text-sm">
                    {r.cta} <IconArrowRight className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={"demo" in r && r.demo ? () => setDemo(true) : undefined}
                    className="btn-ghost text-sm"
                  >
                    Демо
                  </button>
                  <span className="ml-auto text-[11px] text-faint">Подборка</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Каталог ── */}
        <Link
          href="/catalog"
          className="flex items-center gap-4 rounded-xl2 border border-dashed border-line bg-ink-700/40 p-5 transition-colors hover:border-brand-purple/50"
        >
          <div>
            <div className="font-semibold text-fg">Смотреть полный каталог услуг</div>
            <div className="text-sm text-faint">
              Голосовые ассистенты, аналитика и контроль качества
            </div>
          </div>
          <span className="btn-ghost ml-auto">
            Открыть каталог <IconArrowRight className="h-4 w-4" />
          </span>
        </Link>

        {/* ── Подключённые услуги = ассистенты ── */}
        <section>
          <h2 className="mb-3 text-lg font-semibold text-fg">Подключённые услуги</h2>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {CONNECTED_ASSISTANTS.map((a) => (
              <AssistantServiceCard key={a.id} a={a} />
            ))}
          </div>
        </section>
      </div>

      {demo && <QuarterReportDemo onClose={() => setDemo(false)} />}
      {connect && <ConnectModal title={connect} onClose={() => setConnect(null)} />}
    </>
  );
}

function AssistantServiceCard({ a }: { a: (typeof CONNECTED_ASSISTANTS)[number] }) {
  const launching = a.status === "launching";
  const initials = a.manager.split(" ").map((w) => w[0]).join("").slice(0, 2);

  return (
    <div className="card flex flex-col">
      <div className="flex items-start gap-3">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-soft text-brand-purple">
          <IconAssistant className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold leading-tight text-fg">{a.name}</h3>
          <div className="mt-0.5 flex items-center gap-1.5 text-xs text-faint">
            {a.subtitle && <span>{a.subtitle}</span>}
            {a.schedule && (
              <span className="flex items-center gap-1">
                <IconClock className="h-3.5 w-3.5" /> Работает {a.schedule}
              </span>
            )}
          </div>
        </div>
        {launching ? (
          <span className="pill border-amber-500/30 text-amber-300">
            <span className="h-2 w-2 rounded-full bg-amber-400" /> В запуске
          </span>
        ) : (
          <span className="pill border-emerald-500/30 text-emerald-400">
            <PulseDot /> Активна
          </span>
        )}
      </div>

      {launching ? (
        <div className="mt-4 flex-1 rounded-xl border border-dashed border-line bg-ink-600/30 p-4 text-sm text-faint">
          Настраиваем рассылку подтверждений бронирования. Запустим в ближайшее время —
          статистика появится после старта.
        </div>
      ) : (
        <>
          {/* Метрики */}
          <div className="mt-4 grid grid-cols-3 gap-2">
            <Metric label="Закрыто ИИ" value={`${a.aiClosedPct}%`} good />
            <Metric label="Эскалации" value={`${a.escalationPct}%`} />
            <Metric label="Ср. длит." value={fmtDuration(a.avgDurationSec ?? 0)} />
          </div>

          <div className="mt-3 text-sm text-muted">
            Принято звонков за месяц:{" "}
            <span className="font-semibold text-fg">{fmtNumber(a.acceptedMonth ?? 0)}</span>
          </div>
        </>
      )}

      <div className="mt-3 text-xs text-faint">Подключено: {a.connectedAt}</div>

      {/* Менеджер */}
      <div className="mt-4 flex items-center gap-3 border-t border-line/60 pt-3">
        <div className="grid h-7 w-7 place-items-center rounded-lg bg-ink-500 text-[10px] font-bold text-muted">
          {initials}
        </div>
        <div className="text-xs leading-tight">
          <div className="text-faint">Менеджер</div>
          <div className="text-fg">{a.manager}</div>
        </div>
        <div className="ml-auto flex items-center gap-2 text-muted">
          <a href={`tel:${CLIENT.manager.phone}`} className="hover:text-brand-cyan">
            <IconPhone className="h-4 w-4" />
          </a>
          <a href={`mailto:${CLIENT.manager.email}`} className="hover:text-brand-cyan">
            <IconMail className="h-4 w-4" />
          </a>
        </div>
      </div>

      {!launching && (
        <Link
          href="/dashboard"
          className="mt-3 flex items-center gap-1 text-sm font-medium text-brand-purple hover:text-brand-cyan"
        >
          Подробнее <IconArrowRight className="h-3.5 w-3.5" />
        </Link>
      )}
    </div>
  );
}

function Metric({ label, value, good }: { label: string; value: string; good?: boolean }) {
  return (
    <div className="rounded-lg border border-line bg-ink-600/40 p-2 text-center">
      <div className={`text-sm font-bold ${good ? "text-emerald-400" : "text-fg"}`}>{value}</div>
      <div className="mt-0.5 text-[10px] uppercase tracking-wide text-faint">{label}</div>
    </div>
  );
}
