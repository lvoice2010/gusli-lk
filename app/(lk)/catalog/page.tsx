"use client";

import { useState } from "react";
import { Topbar } from "@/components/Topbar";
import {
  IconWave,
  IconDashboard,
  IconSparkle,
  IconPhone,
  IconMail,
  IconCheck,
} from "@/components/icons";
import { QuarterReportDemo } from "@/components/widgets/QuarterReportDemo";
import { ConnectModal } from "@/components/widgets/ConnectModal";

type IconCmp = (p: { className?: string }) => JSX.Element;
type Badge = "new" | "fit" | "soon";

type Service = {
  id: string;
  label: string;
  title: string;
  desc: string;
  features: string[];
  insight?: string;
  price: string;
  badges: Badge[];
  soon?: boolean; // услуга в разработке — без кнопки «Подключить»
  Icon: IconCmp;
  accent: string;
};

// Рекомендации — подобраны под профиль клиента (нагрузка, отрасль, тематики)
const RECOMMENDED: Service[] = [
  {
    id: "ai-report",
    label: "ИИ-аналитика",
    title: "Ежеквартальный ИИ-отчёт",
    desc: "Анализ всех обращений за квартал и рекомендации с прогнозом эффекта на продажи.",
    features: [
      "Анализ 100% обращений за квартал",
      "Карта проблем по тематикам с цифрами",
      "Рекомендации с прогнозом роста продаж",
    ],
    insight: "У клиентов вашей отрасли реализация рекомендаций даёт рост продаж 15–25% за квартал.",
    price: "от 25 000 ₽/квартал",
    badges: ["new", "fit"],
    Icon: IconWave,
    accent: "#f59e0b",
  },
  {
    id: "sms",
    label: "Уведомления",
    title: "SMS-рассылки",
    desc: "Автоподтверждения броней, напоминания и реактивация гостей по SMS — меньше неявок и пустых столов.",
    features: [
      "Подтверждение брони сразу после звонка",
      "Напоминание накануне визита",
      "Реактивация гостей и спецпредложения",
    ],
    insight: "Неявки и поздние отмены — частая причина потерь выручки. SMS-напоминания заметно их сокращают.",
    price: "от 3 ₽/SMS",
    badges: ["fit"],
    Icon: IconMail,
    accent: "#10b981",
  },
  {
    id: "ai-analytics",
    label: "ИИ-аналитика",
    title: "Расширенная ИИ-аналитика",
    desc: "Глубокие срезы тем и тематик, выгрузки и API отчётности для ваших дашбордов.",
    features: [
      "Авторазметка тем и подтем нейросетью",
      "Выгрузки и API отчётности",
      "Срезы по времени, причинам, результату",
    ],
    insight: "≈20% ваших обращений — типовые (бронь, часы работы). ИИ покажет, что автоматизировать дальше.",
    price: "по подписке",
    badges: ["fit"],
    Icon: IconDashboard,
    accent: "#3b82f6",
  },
];

// Новинки квартала — ИИ-инструменты
const NEW: Service[] = [
  {
    id: "ai-trainer",
    label: "ИИ для операторов",
    title: "ИИ-тренер операторов",
    desc: "Тренирует операторов на ваших реальных диалогах: сценарии, разбор ошибок, прогресс.",
    features: [],
    price: "от 9 000 ₽/мес",
    badges: ["new"],
    Icon: IconSparkle,
    accent: "#22d3ee",
  },
  {
    id: "ai-outbound",
    label: "Исходящие",
    title: "Исходящие ИИ-кампании",
    desc: "Ассистент сам обзванивает базу: подтверждения броней, напоминания, реактивация гостей.",
    features: [],
    price: "поминутно · единый тариф",
    badges: ["soon"],
    soon: true,
    Icon: IconPhone,
    accent: "#10b981",
  },
];

const ALL = [...RECOMMENDED, ...NEW];

const BADGE: Record<Badge, { label: string; cls: string }> = {
  new: { label: "Новинка", cls: "bg-brand-gradient text-white" },
  fit: { label: "Подходит вашей отрасли", cls: "border border-brand-purple/40 text-brand-purple" },
  soon: { label: "Скоро", cls: "border border-line text-faint" },
};

function BadgeChip({ kind }: { kind: Badge }) {
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${BADGE[kind].cls}`}>
      {BADGE[kind].label}
    </span>
  );
}

type CatKey = "rec" | "new" | "all";
const CATS: { key: CatKey; label: string; items: Service[]; sub: string; chip?: string }[] = [
  {
    key: "rec",
    label: "Рекомендуем вам",
    items: RECOMMENDED,
    sub: "Подходит для вашей отрасли — похожие компании уже подключили это и видят результат",
    chip: "Подходит вашей отрасли",
  },
  {
    key: "new",
    label: "Новинки",
    items: NEW,
    sub: "Новые услуги и инструменты, которые появились в каталоге в этом квартале",
    chip: "Свежее в каталоге",
  },
  {
    key: "all",
    label: "Все услуги",
    items: ALL,
    sub: "Полный каталог продуктов и ИИ-инструментов КиберГусли",
  },
];

export default function CatalogPage() {
  const [connect, setConnect] = useState<string | null>(null);
  const [demo, setDemo] = useState(false); // демо квартального ИИ-отчёта

  return (
    <>
      <Topbar
        title="Витрина услуг"
        subtitle="Все продукты и услуги КиберГусли — голосовые ИИ-ассистенты, аналитика, ИИ-инструменты"
      />
      <div className="space-y-8 p-4 sm:p-6">
        {/* Герой */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-900 to-indigo-950 p-6 sm:p-8">
          <div className="pointer-events-none absolute -right-10 -top-10 h-56 w-56 rounded-full bg-brand-cyan/20 blur-3xl" />
          <div className="relative">
            <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-brand-cyan">
              Витрина продуктов и услуг КиберГусли
            </div>
            <h2 className="mt-2 max-w-2xl text-2xl font-bold leading-tight text-white sm:text-3xl">
              Каталог КиберГусли — подключайте ИИ-инструменты и расширяйте действующие
            </h2>
            <p className="mt-2 max-w-2xl text-sm text-white/80">
              Можно подключить сразу несколько услуг — оплата по факту, тарифицируются совместно.
              Первый месяц новых ИИ-функций — со скидкой.
            </p>
            <div className="mt-5 grid max-w-2xl grid-cols-2 gap-4 sm:grid-cols-4">
              <Stat value={String(ALL.length + 1)} label="услуг в каталоге" />
              <Stat value="1" label="уже подключено" />
              <Stat value={String(NEW.length)} label="новинок квартала" />
              <Stat value="1 мес" label="со скидкой при старте" />
            </div>
          </div>
        </div>

        {/* Секции каталога — друг под другом */}
        {CATS.map((c) => (
          <section key={c.key}>
            {c.chip && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-purple/15 px-2.5 py-1 text-[11px] font-semibold text-brand-purple">
                <IconSparkle className="h-3.5 w-3.5" /> {c.chip}
              </span>
            )}
            <h3 className="mt-2 text-xl font-bold text-fg">{c.label}</h3>
            <p className="mt-0.5 text-sm text-faint">{c.sub}</p>
            <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {c.items.map((s) => (
                <ServiceCard
                  key={s.id}
                  s={s}
                  onConnect={() => setConnect(s.title)}
                  onDemo={s.id === "ai-report" ? () => setDemo(true) : undefined}
                />
              ))}
            </div>
          </section>
        ))}
      </div>

      {connect && <ConnectModal title={connect} onClose={() => setConnect(null)} />}
      {demo && (
        <QuarterReportDemo
          onClose={() => setDemo(false)}
          onConnect={() => {
            setDemo(false);
            setConnect("Ежеквартальный ИИ-отчёт");
          }}
        />
      )}
    </>
  );
}


function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <div className="text-2xl font-bold text-white">{value}</div>
      <div className="text-[11px] leading-tight text-white/70">{label}</div>
    </div>
  );
}

function ServiceCard({ s, onConnect, onDemo }: { s: Service; onConnect: () => void; onDemo?: () => void }) {
  return (
    <div className="card flex flex-col">
      <div className="flex items-start justify-between gap-2">
        <span
          className="grid h-11 w-11 shrink-0 place-items-center rounded-xl text-white"
          style={{ background: `linear-gradient(135deg, ${s.accent}, #22d3ee)` }}
        >
          <s.Icon className="h-6 w-6" />
        </span>
        <div className="flex flex-wrap justify-end gap-1.5">
          {s.badges.map((b) => (
            <BadgeChip key={b} kind={b} />
          ))}
        </div>
      </div>

      <div className="mt-3 text-[11px] font-semibold uppercase tracking-wide text-faint">{s.label}</div>
      <h4 className="mt-1 font-semibold text-fg">{s.title}</h4>
      <p className="mt-1 text-sm leading-relaxed text-muted">{s.desc}</p>

      {s.features.length > 0 && (
        <ul className="mt-3 space-y-1.5">
          {s.features.map((f) => (
            <li key={f} className="flex items-start gap-2 text-sm text-muted">
              <IconCheck className="mt-0.5 h-4 w-4 shrink-0 text-brand-cyan" />
              {f}
            </li>
          ))}
        </ul>
      )}

      {s.insight && (
        <div className="mt-3 flex gap-2 rounded-lg border border-brand-purple/20 bg-brand-soft p-2.5 text-xs leading-relaxed text-muted">
          <IconSparkle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-cyan" />
          {s.insight}
        </div>
      )}

      <div className="mt-auto pt-4">
        <div className="text-sm font-semibold text-fg">{s.price}</div>
        <div className="mt-2 flex items-center gap-2">
          {s.soon ? (
            <button disabled className="btn-ghost cursor-default text-sm opacity-60">
              Скоро
            </button>
          ) : (
            <>
              <button onClick={onDemo} className="btn-ghost text-sm">
                <IconDashboard className="h-4 w-4" /> Демо
              </button>
              <button onClick={onConnect} className="btn-primary text-sm">
                Подключить
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

