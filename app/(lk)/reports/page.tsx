"use client";

import { useMemo, useState } from "react";
import { Topbar } from "@/components/Topbar";
import { IconWave, IconEye, IconDownload } from "@/components/icons";

type RepType = "Ежемесячный" | "Ежеквартальный";
type Year = "2026" | "2025";

interface Report {
  id: string;
  period: string;
  service: string;
  type: RepType;
  published: string;
  sizeKB: number;
  year: Year;
  status: "ready" | "pending";
}

const REPORTS: Report[] = [
  { id: "r-06", period: "Июнь 2026", service: "Входящая Линия «Рыба моя»", type: "Ежемесячный", published: "—", sizeKB: 0, year: "2026", status: "pending" },
  { id: "r-05", period: "Май 2026", service: "Входящая Линия «Рыба моя»", type: "Ежемесячный", published: "05.06.2026", sizeKB: 164, year: "2026", status: "ready" },
  { id: "r-04", period: "Апрель 2026", service: "Входящая Линия «Рыба моя»", type: "Ежемесячный", published: "05.05.2026", sizeKB: 156, year: "2026", status: "ready" },
  { id: "r-03", period: "Март 2026", service: "Входящая Линия «Рыба моя»", type: "Ежемесячный", published: "05.04.2026", sizeKB: 159, year: "2026", status: "ready" },
  { id: "r-02", period: "Февраль 2026", service: "Входящая Линия «Рыба моя»", type: "Ежемесячный", published: "05.03.2026", sizeKB: 151, year: "2026", status: "ready" },
  { id: "r-01", period: "Январь 2026", service: "Входящая Линия «Рыба моя»", type: "Ежемесячный", published: "05.02.2026", sizeKB: 148, year: "2026", status: "ready" },
  { id: "q1-26", period: "Q1 2026", service: "Ежеквартальный ИИ-отчёт", type: "Ежеквартальный", published: "15.04.2026", sizeKB: 580, year: "2026", status: "ready" },
  { id: "r-12-25", period: "Декабрь 2025", service: "Входящая Линия «Рыба моя»", type: "Ежемесячный", published: "05.01.2026", sizeKB: 142, year: "2025", status: "ready" },
  { id: "q4-25", period: "Q4 2025", service: "Ежеквартальный ИИ-отчёт", type: "Ежеквартальный", published: "15.01.2026", sizeKB: 540, year: "2025", status: "ready" },
];

const TYPE_STYLE: Record<RepType, string> = {
  Ежемесячный: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
  Ежеквартальный: "border-brand-cyan/30 bg-brand-cyan/10 text-brand-cyan",
};

export default function ReportsPage() {
  const all = useMemo(() => REPORTS, []);
  const [type, setType] = useState<"all" | RepType>("all");
  const [year, setYear] = useState<"all" | Year>("all");

  const rows = all.filter((r) => {
    if (type !== "all" && r.type !== type) return false;
    if (year !== "all" && r.year !== year) return false;
    return true;
  });

  return (
    <>
      <Topbar
        title="Отчёты"
        subtitle="Готовые отчёты по работе ассистента — сканы PDF в портале"
      />
      <div className="space-y-5 p-6">
        {/* Фильтры */}
        <div className="flex flex-wrap items-center gap-3">
          <Segmented
            options={[
              { key: "all", label: "Все" },
              { key: "Ежемесячный", label: "Ежемесячные" },
              { key: "Ежеквартальный", label: "Квартальные" },
            ]}
            value={type}
            onChange={(v) => setType(v as "all" | RepType)}
          />
          <Segmented
            options={[
              { key: "all", label: "Все годы" },
              { key: "2026", label: "2026" },
              { key: "2025", label: "2025" },
            ]}
            value={year}
            onChange={(v) => setYear(v as "all" | Year)}
          />
          <span className="ml-auto text-xs text-faint">Показано {rows.length}</span>
        </div>

        {/* Таблица */}
        <div className="card !p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-sm">
              <thead>
                <tr className="border-b border-line text-left text-xs uppercase tracking-wide text-faint">
                  <th className="px-5 py-3 font-medium">Период</th>
                  <th className="px-5 py-3 font-medium">Услуга</th>
                  <th className="px-5 py-3 font-medium">Тип</th>
                  <th className="px-5 py-3 font-medium">Опубликован</th>
                  <th className="px-5 py-3 text-right font-medium">Действия</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id} className="border-t border-line/50 transition-colors hover:bg-ink-600/30">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-brand-soft text-brand-purple">
                          <IconWave className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="font-medium text-fg">{r.period}</div>
                          <div className="text-[11px] text-faint">
                            {r.status === "ready" ? `PDF · ${r.sizeKB} КБ` : "ещё не сформирован"}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-muted">{r.service}</td>
                    <td className="px-5 py-3">
                      <span className={`pill ${TYPE_STYLE[r.type]}`}>{r.type}</span>
                    </td>
                    <td className="whitespace-nowrap px-5 py-3 text-muted">
                      {r.status === "ready" ? r.published : "—"}
                    </td>
                    <td className="px-5 py-3">
                      {r.status === "ready" ? (
                        <div className="flex items-center justify-end gap-2">
                          <button className="btn-ghost !px-3 !py-1.5 text-xs">
                            <IconEye className="h-4 w-4" /> Посмотреть
                          </button>
                          <button className="btn-primary !px-3 !py-1.5 text-xs">
                            <IconDownload className="h-4 w-4" /> Скачать
                          </button>
                        </div>
                      ) : (
                        <div className="flex justify-end">
                          <span className="pill text-faint">Формируется</span>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
                {rows.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-5 py-12 text-center text-sm text-faint">
                      Отчётов не найдено — измените фильтры.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <p className="text-xs text-faint">
          Ежемесячные отчёты публикуются в начале следующего месяца, квартальные — после
          закрытия квартала.
        </p>
      </div>
    </>
  );
}

function Segmented({
  options,
  value,
  onChange,
}: {
  options: { key: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="inline-flex items-center gap-1 rounded-xl border border-line bg-ink-700/70 p-1 text-sm">
      {options.map((o) => (
        <button
          key={o.key}
          onClick={() => onChange(o.key)}
          className={`rounded-lg px-3 py-1.5 font-medium transition-colors ${
            value === o.key ? "bg-brand-gradient text-white" : "text-muted hover:text-fg"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
