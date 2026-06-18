"use client";

import { useMemo, useState } from "react";
import { Topbar } from "@/components/Topbar";
import { PeriodSwitcher } from "@/components/PeriodSwitcher";
import { KpiCard } from "@/components/KpiCard";
import { SectionCard } from "@/components/widgets/SectionCard";
import { Escalation } from "@/components/widgets/Escalation";
import { RoiPanel } from "@/components/widgets/RoiPanel";
import { IntegrationsPanel } from "@/components/widgets/Integrations";
import { Bars } from "@/components/charts/Bars";
import { LineTrend } from "@/components/charts/LineTrend";
import { Heatmap } from "@/components/charts/Heatmap";
import { MonthlyTrend } from "@/components/charts/MonthlyTrend";
import { MonthToMonth } from "@/components/widgets/MonthToMonth";
import { YearTable } from "@/components/widgets/YearTable";
import { CallsTable } from "@/components/widgets/CallsTable";
import Link from "next/link";
import { PulseDot } from "@/components/PulseDot";
import { IconDownload, IconPhone, IconMail, IconArrowUp, IconDoc } from "@/components/icons";
import { getReport, CLIENT, YEAR_STATS, MONTHLY_TREND } from "@/lib/mock";
import { fmtNumber, fmtDuration, fmtPercent } from "@/lib/format";
import type { PeriodKey } from "@/lib/types";

const TABS = ["Отчёты", "Аналитика", "База знаний", "Диалоги"] as const;
type Tab = (typeof TABS)[number];

// Что входит в услугу «Входящая Линия» (голосовой ассистент для ресторана)
const SERVICE_INCLUDES = [
  "Приём входящих звонков 24/7",
  "Поддержка на русском языке",
  "Бронирование столов и запись гостей",
  "Подтверждение и отмена броней",
  "Ответы по меню, часам работы и адресу",
  "Интеграция с Restoplace",
  "Запись разговоров и хранение 90 дней",
  "Ежемесячный отчёт по обращениям",
];

export default function DashboardPage() {
  const [period, setPeriod] = useState<PeriodKey>("month");
  const [tab, setTab] = useState<Tab>("Отчёты");
  const [infoOpen, setInfoOpen] = useState(true);
  const managerInitials = CLIENT.manager.name.split(" ").map((w) => w[0]).join("").slice(0, 2);
  const r = useMemo(() => getReport(period), [period]);
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
          <div className="flex flex-wrap items-start gap-4">
            {/* Название линии + статус */}
            <div className="min-w-[220px] flex-1">
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

            {/* Менеджер + контакты */}
            <div className="flex w-56 shrink-0 items-start gap-3 rounded-xl border border-line bg-ink-600/40 px-3 py-2.5">
              <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-ink-500 text-[11px] font-bold text-muted">
                {managerInitials}
              </div>
              <div className="text-sm leading-tight">
                <div className="text-xs text-faint">Менеджер</div>
                <div className="font-medium text-fg">{CLIENT.manager.name}</div>
                <div className="mt-1.5 space-y-1">
                  <a
                    href={`tel:${CLIENT.manager.phone}`}
                    className="flex items-center gap-1.5 text-xs text-muted hover:text-brand-cyan"
                  >
                    <IconPhone className="h-3.5 w-3.5" /> {CLIENT.manager.phone}
                  </a>
                  <a
                    href={`mailto:${CLIENT.manager.email}`}
                    className="flex items-center gap-1.5 text-xs text-muted hover:text-brand-cyan"
                  >
                    <IconMail className="h-3.5 w-3.5" /> {CLIENT.manager.email}
                  </a>
                </div>
              </div>
            </div>

            {/* Отчёты */}
            <div className="w-56 shrink-0 rounded-xl border border-line bg-ink-600/40 p-3">
              <div className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-faint">
                Отчёты
              </div>
              <button
                onClick={() => window.print()}
                className="btn-primary w-full whitespace-nowrap text-sm"
              >
                <IconDownload className="h-4 w-4" /> Скачать за май
              </button>
              <Link href="/reports" className="btn-ghost mt-2 w-full whitespace-nowrap text-sm">
                <IconDoc className="h-4 w-4" /> Архив (8)
              </Link>
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
            <div className="mt-4 grid gap-6 border-t border-line pt-4 md:grid-cols-3">
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
          )}
        </div>

        {/* Табы */}
        <div className="flex gap-1 border-b border-line">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`relative px-4 py-2.5 text-sm font-medium transition-colors ${
                tab === t ? "text-fg" : "text-faint hover:text-muted"
              }`}
            >
              {t}
              {tab === t && (
                <span className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-brand-gradient" />
              )}
            </button>
          ))}
        </div>

        {/* ── Вкладка: Отчёты ── */}
        {tab === "Отчёты" && (
          <div className="space-y-5">
            {/* Переключатель периода + контекст сравнения */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <PeriodSwitcher value={period} onChange={setPeriod} />
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
                hint="Суммарная длительность обработанных диалогов, округлённая до минут (поминутная тарификация)."
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
                hint="Сравнение ключевых показателей текущего месяца с предыдущим."
              >
                <MonthToMonth
                  current={YEAR_STATS["2026"][YEAR_STATS["2026"].length - 1]}
                  previous={YEAR_STATS["2026"][YEAR_STATS["2026"].length - 2]}
                  currentLabel="Май"
                  previousLabel="Апрель"
                />
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

        {/* ── Вкладка: Аналитика ── */}
        {tab === "Аналитика" && (
          <div className="space-y-5">
            <SectionCard
              title="Динамика обращений"
              hint="Всего обращений (сплошная) и закрыто ИИ (пунктир) в разрезе периода."
              right={
                <div className="flex items-center gap-4 text-xs text-faint">
                  <span className="flex items-center gap-1.5">
                    <span className="h-1.5 w-4 rounded bg-brand-cyan" /> Всего
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="h-1.5 w-4 rounded bg-brand-blue" /> Закрыто ИИ
                  </span>
                </div>
              }
            >
              <LineTrend points={r.trend.points} />
              <div className="mt-2 text-center text-xs text-faint">{r.trend.unit}</div>
            </SectionCard>

            <SectionCard
              title="Почасовая карта нагрузки"
              hint="Когда поступают обращения — по дням недели и часам. Помогает планировать смены."
            >
              <Heatmap />
            </SectionCard>
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

// Используемая база знаний — на основе чего ассистент отвечает.
// Клиент видит сами записи (что и по какой цене), чтобы проверить ответы ассистента.
// Управление содержимым — на стороне КиберГусли (у клиента только просмотр).
type KbEntry = { name: string; value?: string; tag?: string; note?: string };
type KbSection = {
  id: string;
  title: string;
  kind: "menu" | "facts" | "faq";
  source: string; // где указано — источник записи
  updated: string;
  entries: KbEntry[];
};

const KB: KbSection[] = [
  {
    id: "menu",
    title: "Меню и цены",
    kind: "menu",
    source: "Меню зала «Рыба моя»",
    updated: "02.06.2026",
    entries: [
      { name: "Тартар из лосося", value: "690 ₽", tag: "Закуски" },
      { name: "Устрицы Фин де Клер", value: "320 ₽", tag: "Закуски", note: "цена за 1 шт." },
      { name: "Северные креветки", value: "850 ₽", tag: "Закуски", note: "сегодня в стоп-листе" },
      { name: "Цезарь с креветками", value: "720 ₽", tag: "Салаты" },
      { name: "Салат с тунцом", value: "640 ₽", tag: "Салаты" },
      { name: "Уха по-царски", value: "560 ₽", tag: "Супы" },
      { name: "Том ям с морепродуктами", value: "690 ₽", tag: "Супы" },
      { name: "Дорадо на гриле", value: "1 290 ₽", tag: "Горячее" },
      { name: "Сибас целиком", value: "1 450 ₽", tag: "Горячее" },
      { name: "Стейк из лосося", value: "1 180 ₽", tag: "Горячее" },
      { name: "Филе трески", value: "980 ₽", tag: "Горячее" },
      { name: "Лимонад домашний", value: "350 ₽", tag: "Бар", note: "облепиха / цитрус" },
      { name: "Вино белое, бокал 150 мл", value: "450 ₽", tag: "Бар" },
    ],
  },
  {
    id: "hours",
    title: "Часы работы и адрес",
    kind: "facts",
    source: "Карточка заведения",
    updated: "12.05.2026",
    entries: [
      { name: "Пн–Чт", value: "12:00 – 24:00" },
      { name: "Пт–Сб", value: "12:00 – 02:00" },
      { name: "Воскресенье", value: "12:00 – 24:00" },
      { name: "Адрес", value: "Москва, Кутузовский пр-т, 12" },
      { name: "Метро", value: "Кутузовская, 5 минут пешком" },
      { name: "Парковка", value: "Бесплатная для гостей, въезд со двора" },
    ],
  },
  {
    id: "booking",
    title: "Правила бронирования",
    kind: "facts",
    source: "Регламент бронирования",
    updated: "28.05.2026",
    entries: [
      { name: "Депозит на стол", value: "от 6 гостей — 1 000 ₽/чел." },
      { name: "Время удержания стола", value: "20 минут после брони" },
      { name: "Бронь без согласования", value: "до 8 гостей" },
      { name: "Отмена брони", value: "не позднее чем за 3 часа" },
      { name: "Детское меню / стульчики", value: "есть, предупредить заранее" },
      { name: "Можно с животными", value: "только на летней веранде" },
    ],
  },
  {
    id: "banquet",
    title: "Банкеты и мероприятия",
    kind: "facts",
    source: "Прайс банкетов",
    updated: "20.05.2026",
    entries: [
      { name: "Каминный зал", value: "до 25 гостей" },
      { name: "Основной зал (выкуп)", value: "до 60 гостей" },
      { name: "Минимальный депозит банкета", value: "от 60 000 ₽" },
      { name: "Банкетное меню", value: "сет от 3 500 ₽/чел." },
      { name: "Предоплата", value: "50% за 5 дней до даты" },
    ],
  },
  {
    id: "faq",
    title: "Частые вопросы (FAQ)",
    kind: "faq",
    source: "Скрипты ответов",
    updated: "30.05.2026",
    entries: [
      { name: "Есть ли веганские блюда?", note: "Да, отдельный раздел в меню: салаты, паста и боул без продуктов животного происхождения." },
      { name: "Можно прийти со своим тортом?", note: "Да, пробковый сбор за торт — 500 ₽." },
      { name: "Принимаете оплату картой?", note: "Да: карты, СБП и наличные. Чаевые — отдельно по QR." },
      { name: "Есть ли Wi-Fi?", note: "Да, бесплатный. Пароль скажет официант." },
    ],
  },
];

function KbRow({ e, kind }: { e: KbEntry; kind: KbSection["kind"] }) {
  if (kind === "faq") {
    return (
      <div className="py-2.5">
        <div className="text-sm font-medium text-fg">{e.name}</div>
        <div className="mt-0.5 text-sm text-muted">{e.note}</div>
      </div>
    );
  }
  return (
    <div className="flex items-start justify-between gap-3 py-2.5">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          {e.tag && <span className="pill text-faint">{e.tag}</span>}
          <span className="text-sm font-medium text-fg">{e.name}</span>
        </div>
        {e.note && <div className="mt-0.5 text-xs text-faint">{e.note}</div>}
      </div>
      {e.value && (
        <span className="shrink-0 whitespace-nowrap text-sm font-semibold text-fg">{e.value}</span>
      )}
    </div>
  );
}

function KnowledgeBase() {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState<Record<string, boolean>>({ menu: true });
  const query = q.trim().toLowerCase();
  const total = KB.reduce((n, s) => n + s.entries.length, 0);

  const match = (e: KbEntry) =>
    !query ||
    [e.name, e.value, e.note, e.tag].some((x) => x?.toLowerCase().includes(query));

  return (
    <div className="space-y-4">
      {/* Статус базы + кто ею управляет */}
      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-line bg-ink-600/40 p-3 text-sm text-muted">
        <span className="pill border-emerald-500/30 text-emerald-400">
          <span className="h-2 w-2 rounded-full bg-emerald-400" /> Активна
        </span>
        <span>{total} записей · последнее обновление 02.06.2026</span>
        <span className="ml-auto text-xs text-faint">
          Изменения вносит команда КиберГусли — напишите менеджеру
        </span>
      </div>

      <p className="text-sm text-muted">
        Здесь видно, на основе каких данных ассистент отвечает гостям. Если ответ показался
        неверным — сверьтесь с записью ниже: что и по какой цене указано и в каком источнике.
      </p>

      {/* Поиск по всем записям */}
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Поиск по базе: блюдо, цена, правило…"
        className="w-full rounded-xl border border-line bg-ink-600/40 px-3.5 py-2.5 text-sm text-fg placeholder:text-faint focus:border-brand-purple focus:outline-none"
      />

      {/* Разделы базы знаний — раскрываются по клику */}
      <div className="space-y-3">
        {KB.map((s) => {
          const entries = s.entries.filter(match);
          if (query && entries.length === 0) return null;
          const isOpen = query ? true : !!open[s.id];
          return (
            <div key={s.id} className="overflow-hidden rounded-xl border border-line bg-ink-700/50">
              <button
                onClick={() => setOpen((o) => ({ ...o, [s.id]: !o[s.id] }))}
                className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-ink-600/40"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium text-fg">{s.title}</h4>
                    <span className="text-xs text-faint">{entries.length} записей</span>
                  </div>
                  <div className="mt-0.5 text-[11px] text-faint">
                    Источник: {s.source} · обновлено {s.updated}
                  </div>
                </div>
                <IconArrowUp
                  className={`h-4 w-4 shrink-0 text-faint transition-transform ${isOpen ? "" : "rotate-180"}`}
                />
              </button>
              {isOpen && (
                <div className="divide-y divide-line border-t border-line px-4 py-1">
                  {entries.map((e) => (
                    <KbRow key={e.name} e={e} kind={s.kind} />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
