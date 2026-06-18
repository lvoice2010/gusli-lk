// Форматирование под русскую локаль

export function fmtNumber(n: number): string {
  return new Intl.NumberFormat("ru-RU").format(n);
}

export function fmtMoney(n: number): string {
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
    maximumFractionDigits: 0,
  }).format(n);
}

// Длительность с точностью до секунд: "1 мин 30 сек" / "0 сек"
export function fmtDuration(totalSec: number): string {
  const sec = Math.max(0, Math.round(totalSec));
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  const parts: string[] = [];
  if (h) parts.push(`${h} ч`);
  if (m) parts.push(`${m} мин`);
  parts.push(`${s} сек`);
  return parts.join(" ");
}

export function fmtPercent(n: number, digits = 0): string {
  return `${n.toFixed(digits)}%`;
}

// Подпись дельты для сравнения с предыдущим периодом.
// Возвращает null, если изменение нулевое — чтобы не рисовать "на 0% больше".
export function deltaLabel(
  current: number,
  previous: number
): { text: string; dir: "up" | "down"; good: boolean } | null {
  if (previous === 0 && current === 0) return null;
  if (previous === 0) {
    return { text: "новое", dir: "up", good: true };
  }
  const diff = ((current - previous) / previous) * 100;
  if (Math.abs(diff) < 0.5) return null; // незначимое изменение — не показываем
  const dir = diff > 0 ? "up" : "down";
  return {
    text: `${diff > 0 ? "+" : ""}${diff.toFixed(0)}%`,
    dir,
    good: diff > 0,
  };
}
