"use client";

import { useMemo, useState } from "react";
import { Topbar } from "@/components/Topbar";
import { PeriodSwitcher, type CustomRange } from "@/components/PeriodSwitcher";
import { KpiCard } from "@/components/KpiCard";
import { SectionCard } from "@/components/widgets/SectionCard";
import { Escalation } from "@/components/widgets/Escalation";
import { RoiPanel } from "@/components/widgets/RoiPanel";
import { IntegrationsPanel } from "@/components/widgets/Integrations";
import { TestAssistant } from "@/components/widgets/TestAssistant";
import { Bars } from "@/components/charts/Bars";
import { Heatmap } from "@/components/charts/Heatmap";
import { MonthlyTrend } from "@/components/charts/MonthlyTrend";
import { MonthToMonth } from "@/components/widgets/MonthToMonth";
import { YearTable } from "@/components/widgets/YearTable";
import { CallsTable } from "@/components/widgets/CallsTable";
import Link from "next/link";
import { PulseDot } from "@/components/PulseDot";
import { IconDownload, IconPhone, IconMail, IconArrowUp, IconDoc, IconDashboard, IconBook } from "@/components/icons";
import { getReport, getCustomReport, CLIENT, MONTHLY_TREND } from "@/lib/mock";
import { fmtNumber, fmtDuration, fmtPercent } from "@/lib/format";
import type { PeriodKey } from "@/lib/types";

// «Аналитика» пока скрыта — вернём на след. итерации
const TABS = ["Отчёты", "База знаний", "Диалоги"] as const;
type Tab = (typeof TABS)[number];

// Иконки вкладок
const TAB_ICONS: Record<Tab, (p: { className?: string }) => JSX.Element> = {
  "Отчёты": IconDashboard,
  "База знаний": IconBook,
  "Диалоги": IconPhone,
};

// Что входит в услугу «Входящая Линия» (голосовой ассистент для ресторана)
const SERVICE_INCLUDES = [
  "Приём входящих звонков 24/7",
  "Поддержка на русском и английском языке",
  "Бронирование столов и запись гостей",
  "Подтверждение и отмена броней",
  "Ответы по меню, часам работы и адресу",
  "Интеграция с Restoplace",
  "Запись разговоров и хранение 90 дней",
  "Ежемесячный отчёт по обращениям",
];

export default function DashboardPage() {
  const [period, setPeriod] = useState<PeriodKey>("month");
  const [customRange, setCustomRange] = useState<CustomRange | null>(null);
  const [tab, setTab] = useState<Tab>("Отчёты");
  const [infoOpen, setInfoOpen] = useState(false);
  const r = useMemo(
    () =>
      period === "custom" && customRange
        ? getCustomReport(customRange.from, customRange.to)
        : getReport(period),
    [period, customRange]
  );
  const k = r.kpi.current;
  const p = r.kpi.previous;
  // Минуты за период (округлённые) — для поминутной тарификации
  const minutes = Math.round((k.total * k.avgDurationSec) / 60);
  const prevMinutes = Math.round((p.total * p.avgDurationSec) / 60);

  // Разбивка обращений: целевые / нецелевые, конверсия в брони, экономия на нецелевых
  const nontarget = r.classification.find((c) => c.key === "nontarget")?.count ?? 0;
  const targetAll = k.total - nontarget;
  const bookings = Math.round(k.total * 0.34);
  const npct = Math.round((nontarget / k.total) * 100);
  const tpct = 100 - npct;
  const conv = targetAll ? Math.round((bookings / targetAll) * 100) : 0;

  return (
    <>
      <Topbar back={{ href: "/home", label: "Все услуги" }} subtitle="Услуга" />

      <div className="space-y-5 p-6">
        {/* Карточка услуги: название, статус, менеджер, отчёты + раскрывающиеся условия */}
        <div className="card">
          <div className="flex flex-wrap items-stretch gap-4">
            {/* Название линии + статус */}
            <div className="min-w-[220px]">
              <h2 className="text-2xl font-bold text-fg">{CLIENT.assistantName}</h2>
              <div className="mt-0.5 text-sm text-faint">Голосовой ассистент · входящая линия</div>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <span className="pill border-emerald-500/30 text-emerald-400">
                  <PulseDot />
                  Активна
                </span>
                <span className="pill text-muted">
                  <IconPhone className="h-3.5 w-3.5" /> +7 999 200-10-10
                </span>
              </div>
            </div>

            {/* Десктоп: три блока в ряд (на мобиле — внутри «Условия и состав услуги») */}
            <div className="hidden lg:flex lg:flex-1 lg:flex-wrap lg:items-stretch lg:gap-4">
              <TestAssistant />
              <ManagerCard />
              <ReportsCard />
            </div>
          </div>

          <button
            onClick={() => setInfoOpen((o) => !o)}
            className="mt-4 flex items-center gap-1.5 text-sm font-medium text-brand-purple hover:text-brand-cyan"
          >
            {infoOpen ? "Свернуть условия и состав услуги" : "Условия и состав услуги"}
            <IconArrowUp className={`h-3.5 w-3.5 transition-transform ${infoOpen ? "" : "rotate-180"}`} />
          </button>

          {infoOpen && (
            <div className="mt-4 space-y-6 border-t border-line pt-4">
              {/* Моб.: блоки услуги (на десктопе они в шапке) */}
              <div className="space-y-3 lg:hidden">
                <TestAssistant />
                <ManagerCard full />
                <ReportsCard full />
              </div>

              <div className="grid gap-6 md:grid-cols-3">
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-wide text-faint">
                    Договор
                  </div>
                <div className="mt-1.5 font-medium text-fg">№ CG-2026-0412 от 12.01.2026</div>
                <div className="mt-0.5 text-sm text-faint">Контрагент: ООО «Кибер Гусли»</div>
              </div>
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-wide text-faint">
                  График работы
                </div>
                <div className="mt-1.5 font-medium text-fg">24/7, без выходных и праздников</div>
              </div>
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-wide text-faint">
                  Что входит в услугу
                </div>
                <ul className="mt-1.5 space-y-1.5 text-sm text-muted">
                  {SERVICE_INCLUDES.map((x) => (
                    <li key={x} className="flex items-start gap-2">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-cyan" />
                      {x}
                    </li>
                  ))}
                </ul>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Табы */}
        <div className="flex gap-1 border-b border-line">
          {TABS.map((t) => {
            const Icon = TAB_ICONS[t];
            return (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`relative flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium transition-colors ${
                  tab === t ? "text-fg" : "text-faint hover:text-muted"
                }`}
              >
                <Icon className="h-4 w-4" />
                {t}
                {tab === t && (
                  <span className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-brand-gradient" />
                )}
              </button>
            );
          })}
        </div>

        {/* ── Вкладка: Отчёты ── */}
        {tab === "Отчёты" && (
          <div className="space-y-5">
            {/* Переключатель периода + контекст сравнения */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <PeriodSwitcher
                value={period}
                onChange={setPeriod}
                customRange={customRange}
                onCustomRange={setCustomRange}
              />
              <span className="text-xs text-faint">
                Период: <span className="text-muted">{r.periodLabel}</span> · сравнение{" "}
                <span className="text-muted">{r.comparisonLabel}</span>
              </span>
            </div>

            {/* KPI-сводка */}
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
              <KpiCard
                label="Всего обращений"
                value={fmtNumber(k.total)}
                current={k.total}
                previous={p.total}
                accent
              />
              <KpiCard
                label="Закрыто ИИ"
                value={fmtPercent((k.aiClosed / k.total) * 100)}
                sub={fmtNumber(k.aiClosed) + " диалогов"}
                current={k.aiClosed}
                previous={p.aiClosed}
                hint="Диалоги, которые ассистент довёл до результата без перевода на оператора."
              />
              <KpiCard
                label="Эскалации"
                value={fmtPercent(k.escalationRate, 0)}
                sub={fmtNumber(k.escalated) + " переводов"}
                current={k.escalated}
                previous={p.escalated}
                higherIsBetter={false}
                hint="Передано живому оператору. Ниже — лучше: ассистент справляется сам."
              />
              <KpiCard
                label="Средняя длительность"
                value={fmtDuration(k.avgDurationSec)}
                current={k.avgDurationSec}
                previous={p.avgDurationSec}
                higherIsBetter={false}
                hint="Среднее время диалога, точность до секунд."
              />
              <KpiCard
                label="Минут за период"
                value={fmtNumber(minutes)}
                current={minutes}
                previous={prevMinutes}
                hint="Суммарная длительность обработанных диалогов"
              />
            </div>

            {/* ИИ vs оператор + Тематика обращений */}
            <div className="grid gap-5 lg:grid-cols-2">
              <SectionCard
                title="ИИ vs оператор"
                hint="Какую долю обращений ассистент закрыл сам, а какую передал оператору и почему."
              >
                <Escalation data={r.escalation} />
              </SectionCard>

              <SectionCard
                title="Тематика обращений"
                hint="Топ тем «о чём звонят» и динамика к прошлому периоду."
              >
                <Bars
                  data={r.topics.map((t) => ({
                    label: t.label,
                    value: t.count,
                    deltaPct: t.deltaPct,
                  }))}
                />
              </SectionCard>
            </div>

            {/* Все обращения + Конверсия в брони */}
            <div className="grid gap-5 lg:grid-cols-2">
              <SectionCard
                title="Все обращения"
                hint="Сколько всего обращений и какая доля целевых и нецелевых."
              >
                <div className="mb-4">
                  <div className="text-3xl font-bold text-fg">{fmtNumber(k.total)}</div>
                  <div className="text-xs text-faint">всего обращений за период</div>
                </div>
                <div className="space-y-3">
                  <div>
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <span className="text-muted">Целевые</span>
                      <span className="flex items-center gap-2">
                        <span className="font-semibold text-emerald-400">{fmtNumber(targetAll)}</span>
                        <span className="text-xs text-faint">{tpct}%</span>
                      </span>
                    </div>
                    <div
                      className="h-9 rounded-lg"
                      style={{ width: `${tpct}%`, background: "linear-gradient(90deg,#10b981,#34d399)" }}
                    />
                  </div>
                  <div>
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <span className="text-muted">Нецелевые</span>
                      <span className="flex items-center gap-2">
                        <span className="font-semibold text-rose-400">{fmtNumber(nontarget)}</span>
                        <span className="text-xs text-faint">{npct}%</span>
                      </span>
                    </div>
                    <div
                      className="h-9 rounded-lg"
                      style={{ width: `${npct}%`, background: "linear-gradient(90deg,#f43f5e,#fb7185)" }}
                    />
                  </div>
                </div>
              </SectionCard>

              <SectionCard
                title="Конверсия в заявки"
                hint="Доля целевых обращений, завершившихся целевым действием — бронью, записью или заявкой (зависит от бизнеса)."
              >
                <div className="flex items-end gap-3">
                  <div className="text-4xl font-bold gradient-text">{conv}%</div>
                  <div className="pb-1 text-sm text-muted">
                    {fmtNumber(bookings)} заявок из {fmtNumber(targetAll)} целевых
                  </div>
                </div>
                <div className="mt-4 space-y-2.5">
                  <div>
                    <div className="mb-1 flex justify-between text-sm">
                      <span className="text-muted">Целевые</span>
                      <span className="font-semibold text-fg">{fmtNumber(targetAll)}</span>
                    </div>
                    <div
                      className="h-8 rounded-lg"
                      style={{ width: "100%", background: "linear-gradient(90deg,#8b5cf6,#22d3ee)" }}
                    />
                  </div>
                  <div>
                    <div className="mb-1 flex justify-between text-sm">
                      <span className="text-muted">Заявки</span>
                      <span className="font-semibold text-fg">{fmtNumber(bookings)}</span>
                    </div>
                    <div
                      className="h-8 rounded-lg"
                      style={{
                        width: `${Math.max(conv, 8)}%`,
                        background: "linear-gradient(90deg,#8b5cf6,#22d3ee)",
                      }}
                    />
                  </div>
                </div>
              </SectionCard>
            </div>

            {/* Почасовая карта нагрузки */}
            <SectionCard
              title="Почасовая карта нагрузки"
              hint="Когда поступают обращения — по дням недели и часам. В ячейках — число звонков."
            >
              <Heatmap />
            </SectionCard>

            {/* Месяц к месяцу + Помесячная динамика */}
            <div className="grid gap-5 lg:grid-cols-2">
              <SectionCard
                title="Месяц к месяцу"
                hint="«Закрытые» — последние завершённые месяцы. «Текущий MTD» — июнь на тек. дату в сравнении с тем же периодом прошлого года."
              >
                <MonthToMonth />
              </SectionCard>

              <SectionCard
                title="Помесячная динамика"
                hint="Динамика обращений за последние 12 месяцев."
                right={
                  <div className="flex items-center gap-3 text-xs text-faint">
                    <span className="flex items-center gap-1.5">
                      <span className="h-1.5 w-4 rounded" style={{ background: "#6366f1" }} /> Принятых
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="h-1.5 w-4 rounded bg-brand-cyan" /> Обработано ИИ
                    </span>
                  </div>
                }
              >
                <MonthlyTrend points={MONTHLY_TREND.filter((p) => !p.forecast)} />
              </SectionCard>
            </div>

            {/* Годовой отчёт по месяцам */}
            <div className="card">
              <YearTable />
            </div>

            {/* Статус интеграций + ROI */}
            <div className="grid gap-5 lg:grid-cols-2">
              <SectionCard
                title="Статус интеграций"
                hint="Действия, выполненные ассистентом в ваших системах за период. Показаны только подключённые."
              >
                <IntegrationsPanel />
              </SectionCard>

              <SectionCard
                title="ROI / экономия"
                hint="Сколько ресурса оператора сэкономил ассистент и сколько это в деньгах. Период выбирается в самом блоке."
              >
                <RoiPanel />
              </SectionCard>
            </div>
          </div>
        )}

        {/* ── Вкладка: Диалоги ── */}
        {tab === "Диалоги" && (
          <SectionCard
            title="Диалоги"
            hint="Все звонки ассистента: тема, тип, эскалация, результат в CRM и расшифровка."
          >
            <CallsTable />
          </SectionCard>
        )}

        {/* ── Вкладка: База знаний ── */}
        {tab === "База знаний" && (
          <SectionCard
            title="Используемая база знаний"
            hint="На основе чего ассистент отвечает клиентам. Управление содержимым — на стороне КиберГусли."
          >
            <KnowledgeBase />
          </SectionCard>
        )}
      </div>
    </>
  );
}

// Карточка менеджера (в шапке услуги и в моб. всплывашке)
function ManagerCard({ full }: { full?: boolean }) {
  const initials = CLIENT.manager.name.split(" ").map((w) => w[0]).join("").slice(0, 2);
  return (
    <div className={`flex shrink-0 flex-col rounded-xl border border-line bg-ink-600/40 p-4 ${full ? "w-full" : "w-56"}`}>
      <div className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-faint">Менеджер</div>
      <div className="flex items-center gap-3">
        <div className="grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-full bg-brand-gradient text-lg font-bold text-white shadow-glow">
          {initials}
        </div>
        <div className="min-w-0">
          <div className="font-semibold leading-tight text-fg">{CLIENT.manager.name}</div>
          <div className="text-xs text-faint">Ваш менеджер</div>
        </div>
      </div>
      <div className="mt-3 space-y-1.5">
        <a href={`tel:${CLIENT.manager.phone}`} className="flex items-center gap-2 text-xs text-muted transition-colors hover:text-brand-cyan">
          <IconPhone className="h-3.5 w-3.5 shrink-0" /> {CLIENT.manager.phone}
        </a>
        <a href={`mailto:${CLIENT.manager.email}`} className="flex items-center gap-2 break-all text-xs text-muted transition-colors hover:text-brand-cyan">
          <IconMail className="h-3.5 w-3.5 shrink-0" /> {CLIENT.manager.email}
        </a>
      </div>
    </div>
  );
}

// Карточка отчётов (в шапке услуги и в моб. всплывашке)
function ReportsCard({ full }: { full?: boolean }) {
  return (
    <div className={`shrink-0 rounded-xl border border-line bg-ink-600/40 p-3 ${full ? "w-full" : "w-56"}`}>
      <div className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-faint">Отчёты</div>
      <button onClick={() => window.print()} className="btn-primary w-full whitespace-nowrap text-sm">
        <IconDownload className="h-4 w-4" /> Скачать за май
      </button>
      <Link href="/reports" className="btn-ghost mt-2 w-full whitespace-nowrap text-sm">
        <IconDoc className="h-4 w-4" /> Архив (8)
      </Link>
    </div>
  );
}

// Используемая база знаний — на основе чего ассистент отвечает.
// Содержимое каждого раздела — обычный текст: менеджер просто вставляет его как есть.
// Управление содержимым — на стороне КиберГусли (у клиента только просмотр).
type Tone = "rose" | "sky" | "amber" | "emerald" | "violet";
type KbSection = {
  id: string;
  title: string;
  source: string; // где указано — источник
  updated: string;
  tone: Tone; // цвет шапки раздела
  text: string; // текст раздела: **жирный**, строки «• » — пункты списка
};

// Цвета шапок и рамок разделов (статичные классы для Tailwind)
const TONE: Record<Tone, { head: string; border: string; bullet: string }> = {
  rose: { head: "bg-rose-500", border: "border-rose-500/40", bullet: "bg-rose-400" },
  sky: { head: "bg-sky-500", border: "border-sky-500/40", bullet: "bg-sky-400" },
  amber: { head: "bg-amber-500", border: "border-amber-500/40", bullet: "bg-amber-400" },
  emerald: { head: "bg-emerald-500", border: "border-emerald-500/40", bullet: "bg-emerald-400" },
  violet: { head: "bg-violet-500", border: "border-violet-500/40", bullet: "bg-violet-400" },
};

const KB: KbSection[] = [
  {
    id: "menu",
    title: "Меню и цены",
    source: "Меню зала «Рыба моя»",
    updated: "02.06.2026",
    tone: "rose",
    text: `**Закуски**
• Тартар из лосося — 690 ₽
• Устрицы Фин де Клер — 320 ₽ (за 1 шт.)
• Северные креветки — 850 ₽ (сегодня в стоп-листе)

**Салаты**
• Цезарь с креветками — 720 ₽
• Салат с тунцом — 640 ₽

**Супы**
• Уха по-царски — 560 ₽
• Том ям с морепродуктами — 690 ₽

**Горячее**
• Дорадо на гриле — 1 290 ₽
• Сибас целиком — 1 450 ₽
• Стейк из лосося — 1 180 ₽
• Филе трески — 980 ₽

**Бар**
• Лимонад домашний — 350 ₽ (облепиха / цитрус)
• Вино белое, бокал 150 мл — 450 ₽`,
  },
  {
    id: "hours",
    title: "Часы работы и адрес",
    source: "Карточка заведения",
    updated: "12.05.2026",
    tone: "sky",
    text: `**Часы работы**
• Пн–Чт: 12:00 – 24:00
• Пт–Сб: 12:00 – 02:00
• Воскресенье: 12:00 – 24:00

**Адрес и как добраться**
Москва, Кутузовский пр-т, 12. Метро **Кутузовская** — 5 минут пешком.
Парковка бесплатная для гостей, въезд со двора.`,
  },
  {
    id: "booking",
    title: "Правила бронирования",
    source: "Регламент бронирования",
    updated: "28.05.2026",
    tone: "amber",
    text: `• Депозит на стол: от 6 гостей — **1 000 ₽/чел.**
• Время удержания стола — **20 минут** после брони
• Бронь без согласования — до **8 гостей**
• Отмена брони — не позднее чем за **3 часа**
• Детское меню и стульчики: есть, предупредить заранее
• С животными — только на летней веранде`,
  },
  {
    id: "banquet",
    title: "Банкеты и мероприятия",
    source: "Прайс банкетов",
    updated: "20.05.2026",
    tone: "emerald",
    text: `• Каминный зал — до **25 гостей**
• Основной зал (выкуп) — до **60 гостей**
• Минимальный депозит банкета — **от 60 000 ₽**
• Банкетное меню — сет **от 3 500 ₽/чел.**
• Предоплата — **50%** за 5 дней до даты`,
  },
  {
    id: "faq",
    title: "Частые вопросы (FAQ)",
    source: "Скрипты ответов",
    updated: "30.05.2026",
    tone: "violet",
    text: `**Есть ли веганские блюда?**
Да, отдельный раздел в меню: салаты, паста и боул без продуктов животного происхождения.

**Можно прийти со своим тортом?**
Да, пробковый сбор за торт — 500 ₽.

**Принимаете оплату картой?**
Да: карты, СБП и наличные. Чаевые — отдельно по QR.

**Есть ли Wi-Fi?**
Да, бесплатный. Пароль скажет официант.`,
  },
];

// Лёгкая разметка текста БЗ: **жирный** и строки «• » как пункты списка
function renderInline(s: string) {
  return s.split(/\*\*(.+?)\*\*/g).map((part, i) =>
    i % 2 === 1 ? (
      <strong key={i} className="font-semibold text-fg">
        {part}
      </strong>
    ) : (
      <span key={i}>{part}</span>
    )
  );
}

function KbText({ text, tone }: { text: string; tone: Tone }) {
  const lines = text.split("\n");
  const blocks: JSX.Element[] = [];
  let bullets: string[] = [];
  const flush = (key: string) => {
    if (!bullets.length) return;
    const items = bullets;
    bullets = [];
    blocks.push(
      <ul key={key} className="space-y-1">
        {items.map((b, i) => (
          <li key={i} className="flex gap-2">
            <span className={`mt-2 h-1.5 w-1.5 shrink-0 rounded-full ${TONE[tone].bullet}`} />
            <span>{renderInline(b)}</span>
          </li>
        ))}
      </ul>
    );
  };
  lines.forEach((ln, i) => {
    const t = ln.trim();
    if (t.startsWith("• ") || t.startsWith("- ")) {
      bullets.push(t.slice(2));
    } else {
      flush(`ul-${i}`);
      if (t === "") blocks.push(<div key={`sp-${i}`} className="h-2" />);
      else
        blocks.push(
          <p key={`p-${i}`} className="leading-relaxed">
            {renderInline(t)}
          </p>
        );
    }
  });
  flush("ul-end");
  return <div className="space-y-1.5 text-sm text-muted">{blocks}</div>;
}

function KnowledgeBase() {
  const [open, setOpen] = useState<Record<string, boolean>>({});

  return (
    <div className="space-y-4">
      {/* Статус базы + кто ею управляет */}
      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-line bg-ink-600/40 p-3 text-sm text-muted">
        <span className="pill border-emerald-500/30 text-emerald-400">
          <span className="h-2 w-2 rounded-full bg-emerald-400" /> Активна
        </span>
        <span>{KB.length} разделов · последнее обновление 02.06.2026</span>
        <span className="ml-auto text-xs text-faint">
          Изменения вносит команда КиберГусли — напишите менеджеру
        </span>
      </div>

      <p className="text-sm text-muted">
        На основе этих текстов ассистент отвечает гостям. Если ответ показался неверным — сверьтесь
        с разделом ниже.
      </p>

      {/* Разделы — раскрываются по клику, внутри сплошной текст */}
      <div className="space-y-3">
        {KB.map((s) => {
          const isOpen = !!open[s.id];
          const tone = TONE[s.tone];
          return (
            <div key={s.id} className="overflow-hidden rounded-xl">
              {/* Цветная шапка раздела */}
              <button
                onClick={() => setOpen((o) => ({ ...o, [s.id]: !o[s.id] }))}
                className={`flex w-full items-center gap-3 px-4 py-3 text-left text-white ${tone.head}`}
              >
                <h4 className="flex-1 font-semibold">{s.title}</h4>
                <IconArrowUp
                  className={`h-4 w-4 shrink-0 transition-transform ${isOpen ? "" : "rotate-180"}`}
                />
              </button>
              {isOpen && (
                <div className={`border-x border-b ${tone.border} bg-ink-700/40 px-4 py-3`}>
                  <div className="mb-2 text-[11px] text-faint">
                    Источник: {s.source} · обновлено {s.updated}
                  </div>
                  <KbText text={s.text} tone={s.tone} />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* CTA: изменить базу знаний — через менеджера */}
      <div className="flex flex-wrap items-center gap-4 rounded-xl border border-brand-cyan/25 bg-brand-soft p-4">
        <div className="min-w-0 flex-1">
          <div className="font-medium text-fg">Нужно изменить базу знаний?</div>
          <p className="mt-0.5 text-sm text-muted">
            База знаний обновляется по согласованию с вашим менеджером. Все правки проходят
            утверждение и тестируются на выборке диалогов.
          </p>
        </div>
        <Link href="/messages" className="btn-primary shrink-0 whitespace-nowrap">
          <IconMail className="h-4 w-4" /> Написать менеджеру
        </Link>
      </div>
    </div>
  );
}
