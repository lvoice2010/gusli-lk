import type {
  PeriodKey,
  ReportData,
  Kpi,
  CallRecord,
  Classification,
} from "./types";

// ─────────────────────────────────────────────────────────────────────────────
// Демо-клиент: ресторан «Рыба моя» — голосовой ассистент на входящей линии.
// Подключённая интеграция: Restoplace (бронирование столов).
// Цифры — демонстрационные, но согласованы между виджетами (прототип).
// ─────────────────────────────────────────────────────────────────────────────

export const CLIENT = {
  company: "ООО «Рыба моя»",
  contactName: "Анна Иванова",
  serviceName: "Входящая линия «Рыба моя»",
  assistantName: "Входящая Линия «Рыба моя»",
  manager: { name: "Юля Головина", phone: "+7 999 123-45-67", email: "y.golovina@cybergusli.ru" },
  operatorRatePerHour: 350, // ₽/час — из настроек, для расчёта ROI
};

// Биллинг: оплата по факту по минутам + ежемесячное сопровождение
export const BILLING = {
  ratePerMin: 13.5, // ₽/мин
  supportPerMonth: 14800, // ₽/мес — сопровождение
  monthMinutes: 4880, // минут за текущий месяц
};

export function monthToPay(): number {
  return Math.round(BILLING.monthMinutes * BILLING.ratePerMin + BILLING.supportPerMonth);
}

interface Base {
  periodLabel: string;
  comparisonLabel: string;
  total: number;
  prevTotal: number;
  escalationRate: number; // доля эскалаций, 0..1
  prevEscalationRate: number;
  avgDurationSec: number;
  prevAvgDurationSec: number;
  costPerDialog: number;
  trendUnit: string;
  trend: { label: string; total: number }[];
}

// Базовые показатели по периодам (демо)
const BASE: Record<Exclude<PeriodKey, "custom">, Base> = {
  today: {
    periodLabel: "Сегодня",
    comparisonLabel: "к этому же времени вчера",
    total: 84,
    prevTotal: 73,
    escalationRate: 0.13,
    prevEscalationRate: 0.18,
    avgDurationSec: 92,
    prevAvgDurationSec: 88,
    costPerDialog: 13.3,
    trendUnit: "по часам",
    trend: [
      { label: "09", total: 6 },
      { label: "10", total: 9 },
      { label: "11", total: 12 },
      { label: "12", total: 14 },
      { label: "13", total: 11 },
      { label: "14", total: 8 },
      { label: "15", total: 7 },
      { label: "16", total: 9 },
      { label: "17", total: 8 },
    ],
  },
  yesterday: {
    periodLabel: "Вчера",
    comparisonLabel: "к позавчера",
    total: 121,
    prevTotal: 118,
    escalationRate: 0.15,
    prevEscalationRate: 0.16,
    avgDurationSec: 95,
    prevAvgDurationSec: 99,
    costPerDialog: 13.1,
    trendUnit: "по часам",
    trend: [
      { label: "09", total: 8 },
      { label: "10", total: 11 },
      { label: "11", total: 15 },
      { label: "12", total: 18 },
      { label: "13", total: 16 },
      { label: "14", total: 13 },
      { label: "15", total: 12 },
      { label: "16", total: 15 },
      { label: "17", total: 13 },
    ],
  },
  week: {
    periodLabel: "Неделя",
    comparisonLabel: "к предыдущей неделе",
    total: 742,
    prevTotal: 689,
    escalationRate: 0.14,
    prevEscalationRate: 0.17,
    avgDurationSec: 94,
    prevAvgDurationSec: 97,
    costPerDialog: 13.2,
    trendUnit: "по дням",
    trend: [
      { label: "Пн", total: 118 },
      { label: "Вт", total: 104 },
      { label: "Ср", total: 96 },
      { label: "Чт", total: 109 },
      { label: "Пт", total: 142 },
      { label: "Сб", total: 98 },
      { label: "Вс", total: 75 },
    ],
  },
  month: {
    periodLabel: "Месяц",
    comparisonLabel: "к предыдущему месяцу",
    total: 3148,
    prevTotal: 2807,
    escalationRate: 0.14,
    prevEscalationRate: 0.18,
    avgDurationSec: 93,
    prevAvgDurationSec: 98,
    costPerDialog: 13.2,
    trendUnit: "по неделям",
    trend: [
      { label: "Нед. 1", total: 712 },
      { label: "Нед. 2", total: 758 },
      { label: "Нед. 3", total: 803 },
      { label: "Нед. 4", total: 875 },
    ],
  },
};

function makeKpi(total: number, escRate: number, avgDur: number, costPerDialog: number): Kpi {
  const escalated = Math.round(total * escRate);
  const aiClosed = total - escalated;
  return {
    total,
    aiClosed,
    escalated,
    escalationRate: +(escRate * 100).toFixed(1),
    avgDurationSec: avgDur,
    cost: Math.round(total * costPerDialog),
  };
}

export function getReport(period: PeriodKey): ReportData {
  const b = BASE[period === "custom" ? "month" : period];

  const current = makeKpi(b.total, b.escalationRate, b.avgDurationSec, b.costPerDialog);
  const previous = makeKpi(
    b.prevTotal,
    b.prevEscalationRate,
    b.prevAvgDurationSec,
    b.costPerDialog
  );

  // Причины перевода на оператора (в сумме = current.escalated)
  const reasonsRaw = [
    { label: "Запрос вне сценария", share: 0.34 },
    { label: "Клиент попросил оператора", share: 0.27 },
    { label: "Спорная ситуация / жалоба", share: 0.18 },
    { label: "Не распознал намерение", share: 0.13 },
    { label: "Технический сбой линии", share: 0.08 },
  ];
  let used = 0;
  const reasons = reasonsRaw.map((r, i) => {
    const isLast = i === reasonsRaw.length - 1;
    const count = isLast
      ? current.escalated - used
      : Math.round(current.escalated * r.share);
    used += count;
    return { label: r.label, count: Math.max(0, count) };
  });

  // Классификация обращений (целевые / повторные / купившие / нецелевые)
  const cls: { key: Classification; label: string; share: number; hint: string }[] = [
    {
      key: "target",
      label: "Целевые",
      share: 0.52,
      hint: "Первичное обращение по профильному вопросу: бронь, меню, часы работы.",
    },
    {
      key: "repeat",
      label: "Повторные",
      share: 0.21,
      hint: "Тот же клиент обращается повторно в рамках периода.",
    },
    {
      key: "bought",
      label: "Купившие",
      share: 0.16,
      hint: "Обращение завершилось бронью/заказом, подтверждённым в CRM.",
    },
    {
      key: "nontarget",
      label: "Нецелевые",
      share: 0.11,
      hint: "Спам, реклама, ошиблись номером, обзвон агентов и предложения услуг.",
    },
  ];
  let usedCls = 0;
  const classification = cls.map((c, i) => {
    const isLast = i === cls.length - 1;
    const count = isLast ? b.total - usedCls : Math.round(b.total * c.share);
    usedCls += count;
    return { key: c.key, label: c.label, count: Math.max(0, count), hint: c.hint };
  });

  // Тематика обращений (топ тем)
  const topicsShare = [
    { label: "Бронирование стола", share: 0.41, delta: 6 },
    { label: "Часы работы / адрес", share: 0.19, delta: -3 },
    { label: "Меню и цены", share: 0.15, delta: 2 },
    { label: "Отмена / перенос брони", share: 0.11, delta: 4 },
    { label: "Банкеты и мероприятия", share: 0.08, delta: 9 },
    { label: "Прочее", share: 0.06, delta: null as number | null },
  ];
  const topics = topicsShare.map((t) => ({
    label: t.label,
    count: Math.round(b.total * t.share),
    deltaPct: t.delta,
  }));

  // Воронка
  const reached = Math.round(b.total * 0.94);
  const target = classification.find((c) => c.key === "target")!.count + classification.find((c) => c.key === "repeat")!.count;
  const leads = Math.round(b.total * 0.34);
  const funnel = [
    {
      label: "Обращения",
      value: b.total,
      def: "Все входящие звонки на линию ассистента за период, включая нецелевые.",
    },
    {
      label: "Дозвонились",
      value: reached,
      def: "Звонки, где ассистент принял вызов и начал диалог (без сорванных на гудках).",
    },
    {
      label: "Целевые",
      value: target,
      def: "Обращения по профильным темам (бронь, меню, часы) — целевые и повторные.",
    },
    {
      label: "Брони / лиды",
      value: leads,
      def: "Диалоги, завершившиеся бронью или заявкой, зафиксированной в Restoplace.",
    },
  ];

  // ROI / экономия
  const aiClosedCount = current.aiClosed;
  const avgHandleSec = current.avgDurationSec;
  const savedMinutes = Math.round((aiClosedCount * avgHandleSec) / 60);
  const savedMoney = Math.round((savedMinutes / 60) * CLIENT.operatorRatePerHour);
  const roi = {
    aiClosedCount,
    avgHandleSec,
    savedMinutes,
    operatorRatePerHour: CLIENT.operatorRatePerHour,
    dialogCost: b.costPerDialog,
    savedMoney,
  };

  // Статус интеграций — показываем только подключённые
  const integrations = [
    {
      name: "Restoplace",
      system: "Бронирование",
      connected: true,
      actionLabel: "броней создано",
      actions: leads,
    },
    {
      name: "Bitrix24",
      system: "CRM",
      connected: false,
      actionLabel: "карточек создано",
      actions: 0,
    },
    {
      name: "YClients",
      system: "Записи",
      connected: false,
      actionLabel: "записей создано",
      actions: 0,
    },
    {
      name: "amoCRM",
      system: "CRM",
      connected: false,
      actionLabel: "сделок создано",
      actions: 0,
    },
  ];

  // Тренд: достраиваем долю ИИ
  const trend = {
    unit: b.trendUnit,
    points: b.trend.map((p) => ({
      label: p.label,
      total: p.total,
      ai: Math.round(p.total * (1 - b.escalationRate)),
    })),
  };

  return {
    periodLabel: b.periodLabel,
    comparisonLabel: b.comparisonLabel,
    kpi: { current, previous },
    escalation: {
      aiClosed: current.aiClosed,
      escalated: current.escalated,
      reasons,
    },
    classification,
    topics,
    funnel,
    roi,
    integrations,
    trend,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Журнал звонков (для раздела «Звонки»)
// ─────────────────────────────────────────────────────────────────────────────

const TOPICS_POOL = [
  "Бронирование стола",
  "Часы работы / адрес",
  "Меню и цены",
  "Отмена / перенос брони",
  "Банкеты и мероприятия",
];
const ESC_REASONS = [
  "Клиент попросил оператора",
  "Запрос вне сценария",
  "Спорная ситуация / жалоба",
  "Не распознал намерение",
];

function pad(n: number) {
  return n < 10 ? `0${n}` : `${n}`;
}

// Детерминированная генерация журнала (без Math.random — стабильно между рендерами)
export function getCalls(): CallRecord[] {
  const rows: CallRecord[] = [];
  const N = 48;
  for (let i = 0; i < N; i++) {
    const escalated = i % 7 === 3 || i % 11 === 0;
    const isTest = i % 23 === 5; // редкие тестовые
    const clsCycle: Classification[] = ["target", "target", "repeat", "bought", "nontarget"];
    const classification = clsCycle[i % clsCycle.length];
    const topic =
      classification === "nontarget" ? "Нецелевое обращение" : TOPICS_POOL[i % TOPICS_POOL.length];
    const durationSec = classification === "nontarget" ? 18 + (i % 10) : 60 + ((i * 13) % 150);
    const hour = 9 + (i % 9);
    const minute = (i * 7) % 60;
    const day = 11 - Math.floor(i / 10);
    const crmResult =
      classification === "bought" && !escalated
        ? `Бронь #${4800 + i} в Restoplace`
        : null;
    rows.push({
      id: `C-${10240 + i}`,
      datetime: `2026-06-${pad(day)}T${pad(hour)}:${pad(minute)}:00`,
      phoneMasked: `+7 9${pad((i * 3) % 100)} ••• ${pad((i * 17) % 100)}-${pad((i * 29) % 100)}`,
      durationSec,
      status: escalated ? "escalated" : "ai",
      classification,
      topic,
      escalated,
      escalationReason: escalated ? ESC_REASONS[i % ESC_REASONS.length] : null,
      crmResult,
      cost: +(durationSec * 0.14).toFixed(1),
      isTest,
    });
  }
  return rows;
}

export const CLASSIFICATION_LABEL: Record<Classification, string> = {
  target: "Целевой",
  repeat: "Повторный",
  bought: "Купивший",
  nontarget: "Нецелевой",
};

// ─────────────────────────────────────────────────────────────────────────────
// Подключённые ассистенты для главного экрана (карточки «Подключённые услуги»)
// Только голосовые, входящие. Поминутная тарификация.
// ─────────────────────────────────────────────────────────────────────────────

export interface AssistantCard {
  id: string;
  name: string;
  subtitle?: string;
  line: string;
  tariff: string; // «Оплата по факту»
  schedule?: string; // график работы, напр. «24/7»
  status: "active" | "launching"; // активна / в запуске
  minutesUsed?: number; // потрачено минут за месяц (оплата по факту)
  cost?: number; // ≈ к оплате за месяц
  acceptedMonth?: number;
  aiClosedPct?: number;
  escalationPct?: number;
  avgDurationSec?: number;
  connectedAt: string;
  manager: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Помесячная статистика (для блоков «Месяц к месяцу», «Помесячная динамика», «Годовой отчёт»)
// ─────────────────────────────────────────────────────────────────────────────

export interface MonthStat {
  label: string;
  incoming: number; // входящие диалоги
  aiHandled: number; // обработано ИИ
  escalations: number;
  escalationRate: number; // %
  avgAnswerSec: number; // среднее время ответа, сек
  avgDialogSec: number; // среднее время диалога, сек
}

export const MONTHS_RU = ["Янв", "Фев", "Мар", "Апр", "Май", "Июн", "Июл", "Авг", "Сен", "Окт", "Ноя", "Дек"];

// 2026 — текущий год, заполнено по май (далее данные появятся)
export const YEAR_STATS: Record<"2026" | "2025", MonthStat[]> = {
  "2026": [
    { label: "Янв", incoming: 1720, aiHandled: 1500, escalations: 220, escalationRate: 12.8, avgAnswerSec: 0.9, avgDialogSec: 95 },
    { label: "Фев", incoming: 1580, aiHandled: 1384, escalations: 196, escalationRate: 12.4, avgAnswerSec: 0.8, avgDialogSec: 94 },
    { label: "Мар", incoming: 1640, aiHandled: 1442, escalations: 198, escalationRate: 12.1, avgAnswerSec: 0.8, avgDialogSec: 93 },
    { label: "Апр", incoming: 1720, aiHandled: 1522, escalations: 198, escalationRate: 11.5, avgAnswerSec: 0.8, avgDialogSec: 91 },
    { label: "Май", incoming: 1800, aiHandled: 1584, escalations: 216, escalationRate: 12.0, avgAnswerSec: 0.8, avgDialogSec: 90 },
  ],
  "2025": [
    { label: "Янв", incoming: 980, aiHandled: 800, escalations: 180, escalationRate: 18.4, avgAnswerSec: 1.2, avgDialogSec: 104 },
    { label: "Фев", incoming: 1020, aiHandled: 845, escalations: 175, escalationRate: 17.2, avgAnswerSec: 1.1, avgDialogSec: 102 },
    { label: "Мар", incoming: 1110, aiHandled: 930, escalations: 180, escalationRate: 16.2, avgAnswerSec: 1.1, avgDialogSec: 101 },
    { label: "Апр", incoming: 1180, aiHandled: 1000, escalations: 180, escalationRate: 15.3, avgAnswerSec: 1.0, avgDialogSec: 99 },
    { label: "Май", incoming: 1240, aiHandled: 1066, escalations: 174, escalationRate: 14.0, avgAnswerSec: 1.0, avgDialogSec: 98 },
    { label: "Июн", incoming: 1210, aiHandled: 1030, escalations: 180, escalationRate: 14.9, avgAnswerSec: 1.0, avgDialogSec: 97 },
    { label: "Июл", incoming: 1180, aiHandled: 1000, escalations: 180, escalationRate: 15.3, avgAnswerSec: 0.9, avgDialogSec: 97 },
    { label: "Авг", incoming: 1200, aiHandled: 1010, escalations: 190, escalationRate: 15.8, avgAnswerSec: 0.9, avgDialogSec: 96 },
    { label: "Сен", incoming: 1340, aiHandled: 1120, escalations: 220, escalationRate: 16.4, avgAnswerSec: 0.9, avgDialogSec: 96 },
    { label: "Окт", incoming: 1480, aiHandled: 1240, escalations: 240, escalationRate: 16.2, avgAnswerSec: 0.9, avgDialogSec: 95 },
    { label: "Ноя", incoming: 1940, aiHandled: 1610, escalations: 330, escalationRate: 17.0, avgAnswerSec: 0.9, avgDialogSec: 95 },
    { label: "Дек", incoming: 1860, aiHandled: 1560, escalations: 300, escalationRate: 16.1, avgAnswerSec: 0.9, avgDialogSec: 94 },
  ],
};

// Помесячная динамика: 12 месяцев истории + прогноз (forecast)
export interface TrendMonth {
  label: string;
  incoming: number;
  ai: number;
  forecast?: boolean;
}

export const MONTHLY_TREND: TrendMonth[] = [
  { label: "Июн 25", incoming: 1210, ai: 1030 },
  { label: "Июл 25", incoming: 1180, ai: 1000 },
  { label: "Авг 25", incoming: 1200, ai: 1010 },
  { label: "Сен 25", incoming: 1340, ai: 1120 },
  { label: "Окт 25", incoming: 1480, ai: 1240 },
  { label: "Ноя 25", incoming: 1940, ai: 1610 },
  { label: "Дек 25", incoming: 1860, ai: 1560 },
  { label: "Янв 26", incoming: 1720, ai: 1500 },
  { label: "Фев 26", incoming: 1580, ai: 1384 },
  { label: "Мар 26", incoming: 1640, ai: 1442 },
  { label: "Апр 26", incoming: 1720, ai: 1522 },
  { label: "Май 26", incoming: 1800, ai: 1584 },
  { label: "Июн 26", incoming: 1980, ai: 1700, forecast: true },
  { label: "Июл 26", incoming: 1820, ai: 1600, forecast: true },
];

export const CONNECTED_ASSISTANTS: AssistantCard[] = [
  {
    id: "asst-inbound",
    name: "Входящая Линия «Рыба моя»",
    line: "+7 999 200-10-10",
    tariff: "Оплата по факту",
    schedule: "24/7",
    status: "active",
    minutesUsed: 4880,
    cost: 41554,
    acceptedMonth: 3148,
    aiClosedPct: 86,
    escalationPct: 14,
    avgDurationSec: 93,
    connectedAt: "12.01.2026",
    manager: CLIENT.manager.name,
  },
  {
    id: "sms",
    name: "SMS-рассылки",
    subtitle: "Подтверждения бронирования",
    line: "—",
    tariff: "Оплата по факту",
    status: "launching",
    connectedAt: "—",
    manager: CLIENT.manager.name,
  },
];
