// Типы доменной модели отчётности по голосовому ассистенту

export type PeriodKey = "today" | "yesterday" | "week" | "month" | "custom";

export type CallStatus = "ai" | "escalated" | "missed";
export type Classification = "target" | "repeat" | "bought" | "nontarget";

export interface Kpi {
  total: number; // всего обращений
  aiClosed: number; // закрыто ИИ
  escalated: number; // передано оператору
  escalationRate: number; // % эскалаций
  avgDurationSec: number; // средняя длительность, сек
  cost: number; // стоимость за период, ₽
}

export interface EscalationReason {
  label: string;
  count: number;
}

export interface ClassificationItem {
  key: Classification;
  label: string;
  count: number;
  hint: string;
}

export interface TopicItem {
  label: string;
  count: number;
  deltaPct: number | null; // динамика к прошлому периоду
}

export interface FunnelStep {
  label: string;
  value: number;
  def: string; // определение для тултипа: что именно считается
  tone?: "good" | "bad"; // окраска: целевые — зелёные, нецелевые — красные
  divider?: boolean; // отделить ступень сверху (напр. «вне воронки»)
}

export interface RoiData {
  aiClosedCount: number;
  avgHandleSec: number; // средняя длительность диалога ИИ
  talkMinutes: number; // разговорные минуты ИИ (чистое время в диалогах)
  occupancy: number; // занятость оператора, 0..1 (на час оплаты — занятость×60 мин разговора)
  savedMinutes: number; // оплачиваемое время оператора = talkMinutes / occupancy
  operatorRatePerHour: number; // ставка оператора, ₽/час
  dialogCost: number; // стоимость диалога ИИ, ₽
  savedMoney: number; // экономия за период, ₽
}

export interface IntegrationStatus {
  name: string;
  system: string;
  connected: boolean;
  actionLabel: string; // напр. "броней создано"
  actions: number;
}

export interface TrendPoint {
  label: string;
  total: number;
  ai: number;
}

export interface ReportData {
  periodLabel: string;
  comparisonLabel: string; // с чем сравниваем
  kpi: { current: Kpi; previous: Kpi };
  escalation: {
    aiClosed: number;
    escalated: number;
    reasons: EscalationReason[];
  };
  classification: ClassificationItem[];
  topics: TopicItem[];
  funnel: FunnelStep[];
  roi: RoiData;
  integrations: IntegrationStatus[];
  trend: { unit: string; points: TrendPoint[] };
}

export interface CallRecord {
  id: string;
  datetime: string; // ISO
  phoneMasked: string;
  durationSec: number;
  status: CallStatus;
  classification: Classification;
  topic: string;
  escalated: boolean;
  escalationReason: string | null;
  crmResult: string | null; // напр. "Бронь #4821 в Restoplace"
  cost: number;
  isTest: boolean;
}
