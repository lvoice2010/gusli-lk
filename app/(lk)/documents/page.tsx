"use client";

import { useMemo, useState } from "react";
import { Topbar } from "@/components/Topbar";
import { IconDoc, IconEye, IconSearch } from "@/components/icons";
import { fmtMoney, fmtNumber } from "@/lib/format";
import { BILLING } from "@/lib/mock";

type DocType = "Счёт" | "Акт" | "Договор";
type DocStatus = "К оплате" | "Ожидает подписи" | "Оплачен" | "Подписан" | "Действует";

interface Doc {
  id: string;
  type: DocType;
  number: string;
  date: string;
  period: string;
  sum: number | null;
  status: DocStatus;
  sizeKB: number;
  year: "2026" | "2025";
}

const sumFor = (min: number) => Math.round(min * BILLING.ratePerMin + BILLING.supportPerMonth);

// Помесячно: на каждый месяц — счёт и акт
const MONTHS: { period: string; date: string; num: string; minutes: number; paid: boolean; year: "2026" | "2025" }[] = [
  { period: "Июнь 2026", date: "30.06.2026", num: "2026-06-133", minutes: 4880, paid: false, year: "2026" },
  { period: "Май 2026", date: "31.05.2026", num: "2026-05-121", minutes: 4310, paid: true, year: "2026" },
  { period: "Апрель 2026", date: "30.04.2026", num: "2026-04-112", minutes: 4520, paid: true, year: "2026" },
  { period: "Март 2026", date: "31.03.2026", num: "2026-03-098", minutes: 4350, paid: true, year: "2026" },
  { period: "Февраль 2026", date: "28.02.2026", num: "2026-02-076", minutes: 4210, paid: true, year: "2026" },
  { period: "Январь 2026", date: "31.01.2026", num: "2026-01-042", minutes: 4090, paid: true, year: "2026" },
  { period: "Декабрь 2025", date: "31.12.2025", num: "2025-12-231", minutes: 3980, paid: true, year: "2025" },
];

function buildDocs(): Doc[] {
  const docs: Doc[] = [];
  MONTHS.forEach((m) => {
    const sum = sumFor(m.minutes);
    docs.push({
      id: `inv-${m.num}`,
      type: "Счёт",
      number: `Счёт № ${m.num}`,
      date: m.date,
      period: m.period,
      sum,
      status: m.paid ? "Оплачен" : "К оплате",
      sizeKB: 200 + (m.minutes % 30),
      year: m.year,
    });
    docs.push({
      id: `act-${m.num}`,
      type: "Акт",
      number: `Акт № ${m.num}`,
      date: m.date,
      period: m.period,
      sum,
      status: m.paid ? "Подписан" : "Ожидает подписи",
      sizeKB: 180 + (m.minutes % 25),
      year: m.year,
    });
  });
  // Договоры
  docs.push({
    id: "dog-1",
    type: "Договор",
    number: "Договор № CG-2026-0412",
    date: "12.01.2026",
    period: "Бессрочный",
    sum: null,
    status: "Действует",
    sizeKB: 240,
    year: "2026",
  });
  docs.push({
    id: "dog-2",
    type: "Договор",
    number: "Доп. соглашение № 1 (SMS-рассылки)",
    date: "01.06.2026",
    period: "Бессрочный",
    sum: null,
    status: "Действует",
    sizeKB: 96,
    year: "2026",
  });
  return docs;
}

const STATUS_STYLE: Record<DocStatus, string> = {
  "К оплате": "border-amber-500/30 bg-amber-500/10 text-amber-400",
  "Ожидает подписи": "border-brand-cyan/30 bg-brand-cyan/10 text-brand-cyan",
  Оплачен: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
  Подписан: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
  Действует: "border-brand-purple/30 bg-brand-purple/10 text-brand-purple",
};

const TYPE_FILTERS: { key: "all" | DocType; label: string }[] = [
  { key: "all", label: "Все" },
  { key: "Счёт", label: "Счета" },
  { key: "Акт", label: "Акты" },
  { key: "Договор", label: "Договоры" },
];

const STATUS_FILTERS: ("all" | DocStatus)[] = [
  "all",
  "К оплате",
  "Ожидает подписи",
  "Оплачен",
  "Подписан",
];

export default function DocumentsPage() {
  const all = useMemo(() => buildDocs(), []);
  const [year, setYear] = useState<"2026" | "2025">("2026");
  const [type, setType] = useState<"all" | DocType>("all");
  const [status, setStatus] = useState<"all" | DocStatus>("all");
  const [query, setQuery] = useState("");
  const [view, setView] = useState<Doc | null>(null);

  const byYear = all.filter((d) => d.year === year);

  // Сводка считается по году
  const invoicesYear = byYear.filter((d) => d.type === "Счёт");
  const yearTotal = invoicesYear.reduce((s, d) => s + (d.sum ?? 0), 0);
  const toPay = byYear
    .filter((d) => d.status === "К оплате")
    .reduce((s, d) => s + (d.sum ?? 0), 0);
  const actsAwaiting = byYear.filter((d) => d.status === "Ожидает подписи").length;

  const rows = byYear.filter((d) => {
    if (type !== "all" && d.type !== type) return false;
    if (status !== "all" && d.status !== status) return false;
    if (query.trim() && !d.number.toLowerCase().includes(query.trim().toLowerCase())) return false;
    return true;
  });

  return (
    <>
      <Topbar
        title="Финансовые документы"
        subtitle="Счета, акты и договоры. Каждый месяц выставляем счёт и акт — сканы PDF в портале."
      />
      <div className="space-y-5 p-6">
        {/* Сводка */}
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="card">
            <div className="card-title">Счетов за {year} год</div>
            <div className="mt-2 text-3xl font-bold text-fg">{fmtMoney(yearTotal)}</div>
            <div className="mt-2 text-xs text-faint">{invoicesYear.length} счёт(ов)</div>
          </div>
          <div className="card">
            <div className="card-title">К оплате</div>
            <div className="mt-2 text-3xl font-bold gradient-text">{fmtMoney(toPay)}</div>
            <div className="mt-2 text-xs text-faint">срок — до конца текущего месяца</div>
          </div>
          <div className="card">
            <div className="card-title">Актов ждёт подписи</div>
            <div className="mt-2 text-3xl font-bold text-fg">{actsAwaiting}</div>
            <div className="mt-2 text-xs text-faint">подписание ЭДО на стороне клиента</div>
          </div>
        </div>

        {/* Фильтры */}
        <div className="flex flex-wrap items-center gap-3">
          <Segmented
            options={[
              { key: "2026", label: "2026" },
              { key: "2025", label: "2025" },
            ]}
            value={year}
            onChange={(v) => setYear(v as "2026" | "2025")}
          />
          <Segmented
            options={TYPE_FILTERS.map((t) => ({ key: t.key, label: t.label }))}
            value={type}
            onChange={(v) => setType(v as "all" | DocType)}
          />
          <Segmented
            options={STATUS_FILTERS.map((s) => ({ key: s, label: s === "all" ? "Все статусы" : s }))}
            value={status}
            onChange={(v) => setStatus(v as "all" | DocStatus)}
          />
          <div className="relative ml-auto">
            <IconSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-faint" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Найти по номеру…"
              className="w-56 rounded-xl border border-line bg-ink-700/70 py-2 pl-9 pr-3 text-sm text-fg outline-none placeholder:text-faint focus:border-brand-purple/50"
            />
          </div>
        </div>

        {/* Таблица */}
        <div className="card !p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-sm">
              <thead>
                <tr className="border-b border-line text-left text-xs uppercase tracking-wide text-faint">
                  <th className="px-5 py-3 font-medium">Дата</th>
                  <th className="px-5 py-3 font-medium">Документ</th>
                  <th className="px-5 py-3 font-medium">Период</th>
                  <th className="px-5 py-3 font-medium">Сумма</th>
                  <th className="px-5 py-3 font-medium">Статус</th>
                  <th className="px-5 py-3 text-right font-medium">Скан</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((d) => (
                  <tr key={d.id} className="border-t border-line/50 transition-colors hover:bg-ink-600/30">
                    <td className="whitespace-nowrap px-5 py-3 text-muted">{d.date}</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div
                          className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg ${
                            d.type === "Договор"
                              ? "bg-brand-soft text-brand-purple"
                              : "bg-ink-500 text-faint"
                          }`}
                        >
                          <IconDoc className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="font-medium text-fg">{d.number}</div>
                          <div className="text-[11px] text-faint">
                            PDF · {d.sizeKB} КБ · загружен {d.date}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-5 py-3 text-muted">{d.period}</td>
                    <td className="whitespace-nowrap px-5 py-3 font-semibold text-fg">
                      {d.sum != null ? fmtMoney(d.sum) : "—"}
                    </td>
                    <td className="px-5 py-3">
                      <span className={`pill ${STATUS_STYLE[d.status]}`}>{d.status}</span>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <button
                        onClick={() => setView(d)}
                        className="btn-ghost !px-3 !py-1.5 text-xs"
                      >
                        <IconEye className="h-4 w-4" /> Посмотреть
                      </button>
                    </td>
                  </tr>
                ))}
                {rows.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-5 py-12 text-center text-sm text-faint">
                      Документы не найдены — измените фильтры.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <p className="text-xs text-faint">
          Документы выставляются автоматически последним рабочим днём месяца. Если нужен счёт
          раньше срока — напишите менеджеру.
        </p>
      </div>

      {view && <DocViewer doc={view} onClose={() => setView(null)} />}
    </>
  );
}

// Просмотр документа во всплывающем окне (демо — открывается пример счёта PDF)
function DocViewer({ doc, onClose }: { doc: Doc; onClose: () => void }) {
  const src = "/invoice-sample.pdf";
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4 backdrop-blur-sm" onClick={onClose}>
      <div
        className="flex h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-line bg-ink-800 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-4 border-b border-line p-4">
          <div className="min-w-0">
            <div className="truncate font-semibold text-fg">{doc.number}</div>
            <div className="text-xs text-faint">{doc.period} · {doc.date}</div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <a href={src} download className="btn-ghost text-sm">Скачать</a>
            <button onClick={onClose} className="btn-ghost !p-2" aria-label="Закрыть">✕</button>
          </div>
        </div>
        <iframe src={src} title={doc.number} className="h-full w-full bg-white" />
      </div>
    </div>
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
