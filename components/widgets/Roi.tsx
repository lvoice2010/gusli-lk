import { fmtMoney, fmtNumber, fmtDuration } from "@/lib/format";
import type { RoiData } from "@/lib/types";

export function Roi({ data }: { data: RoiData }) {
  const hours = Math.floor(data.savedMinutes / 60);
  const mins = data.savedMinutes % 60;

  return (
    <div className="relative overflow-hidden">
      <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-brand-cyan/10 blur-3xl" />
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-brand-purple/30 bg-brand-soft p-4">
          <div className="text-xs text-muted">Экономия за период</div>
          <div className="mt-1 text-2xl font-bold gradient-text">{fmtMoney(data.savedMoney)}</div>
          <div className="mt-1 text-[11px] text-faint">
            по ставке оператора {fmtMoney(data.operatorRatePerHour)}/час
          </div>
        </div>
        <div className="rounded-xl border border-line bg-ink-600/50 p-4">
          <div className="text-xs text-muted">Сэкономлено времени оператора</div>
          <div className="mt-1 text-2xl font-bold text-fg">
            {hours} ч {mins} мин
          </div>
          <div className="mt-1 text-[11px] text-faint">
            {fmtNumber(data.talkMinutes)} мин разговора ÷ занятость {Math.round(data.occupancy * 100)}%
          </div>
        </div>
      </div>

      <ul className="mt-4 space-y-2.5 text-sm">
        <Row label="Обращений закрыто ИИ" value={fmtNumber(data.aiClosedCount)} />
        <Row label="Средняя длительность диалога" value={fmtDuration(data.avgHandleSec)} />
        <Row label="Разговорных минут ИИ" value={fmtNumber(data.talkMinutes)} />
        <Row label="Занятость оператора" value={`${Math.round(data.occupancy * 100)}%`} />
        <Row label="Стоимость одного диалога ИИ" value={fmtMoney(data.dialogCost)} />
      </ul>

      <p className="mt-4 rounded-lg border border-line bg-ink-600/40 p-3 text-xs leading-relaxed text-faint">
        Расчёт: разговорные минуты ИИ ÷ занятость оператора ({Math.round(data.occupancy * 100)}%) =
        оплачиваемые часы оператора × ставка {fmtMoney(data.operatorRatePerHour)}/час. Оператор не
        загружен на 100%: на час оплаты приходится ~{Math.round(data.occupancy * 60)} мин разговора,
        остальное — ожидание и переключения.
      </p>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <li className="flex items-center justify-between border-b border-line/60 pb-2 last:border-0 last:pb-0">
      <span className="text-muted">{label}</span>
      <span className="font-semibold text-fg">{value}</span>
    </li>
  );
}
