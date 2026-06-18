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
            {fmtNumber(data.savedMinutes)} мин суммарно
          </div>
        </div>
      </div>

      <ul className="mt-4 space-y-2.5 text-sm">
        <Row label="Обращений закрыто ИИ" value={fmtNumber(data.aiClosedCount)} />
        <Row label="Средняя длительность диалога" value={fmtDuration(data.avgHandleSec)} />
        <Row label="Стоимость одного диалога ИИ" value={fmtMoney(data.dialogCost)} />
      </ul>

      <p className="mt-4 rounded-lg border border-line bg-ink-600/40 p-3 text-xs leading-relaxed text-faint">
        Расчёт: закрытые ИИ обращения × средняя длительность = сэкономленные минуты
        оператора, переведённые в деньги по вашей ставке из настроек.
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
