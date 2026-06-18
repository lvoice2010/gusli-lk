"use client";

import { useMemo, useState } from "react";
import { InfoTip } from "@/components/ui/Tooltip";
import { getCalls, CLASSIFICATION_LABEL } from "@/lib/mock";
import { fmtDuration, fmtMoney } from "@/lib/format";
import type { CallRecord } from "@/lib/types";

type TestFilter = "live" | "all" | "test";

// Журнал звонков (диалогов) ассистента — используется во вкладке «Диалоги».
export function CallsTable() {
  const all = useMemo(() => getCalls(), []);
  const [testFilter, setTestFilter] = useState<TestFilter>("live");
  const [escOnly, setEscOnly] = useState(false);
  const [open, setOpen] = useState<CallRecord | null>(null);

  const rows = all.filter((c) => {
    if (testFilter === "live" && c.isTest) return false;
    if (testFilter === "test" && !c.isTest) return false;
    if (escOnly && !c.escalated) return false;
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Фильтры */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="inline-flex items-center gap-1 rounded-xl border border-line bg-ink-700/70 p-1 text-sm">
          {([
            ["live", "Боевые"],
            ["test", "Тестовые"],
            ["all", "Все"],
          ] as [TestFilter, string][]).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setTestFilter(key)}
              className={`rounded-lg px-3 py-1.5 font-medium transition-colors ${
                testFilter === key ? "bg-brand-gradient text-white" : "text-muted hover:text-fg"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <label className="flex cursor-pointer items-center gap-2 text-sm text-muted">
          <input
            type="checkbox"
            checked={escOnly}
            onChange={(e) => setEscOnly(e.target.checked)}
            className="h-4 w-4 accent-brand-purple"
          />
          Только эскалации
        </label>
        <span className="ml-auto text-xs text-faint">
          Показано {rows.length} из {all.length}
          {testFilter === "live" && " · тестовые скрыты из статистики"}
        </span>
      </div>

      {/* Таблица */}
      <div className="overflow-hidden rounded-xl border border-line">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-sm">
            <thead>
              <tr className="border-b border-line bg-ink-600/30 text-left text-xs uppercase tracking-wide text-faint">
                <th className="px-4 py-3 font-medium">Время</th>
                <th className="px-4 py-3 font-medium">Номер</th>
                <th className="px-4 py-3 font-medium">Тема</th>
                <th className="px-4 py-3 font-medium">Тип</th>
                <th className="px-4 py-3 font-medium">
                  <span className="inline-flex items-center gap-1">
                    Эскалация
                    <InfoTip text="Был ли диалог передан оператору и по какой причине." />
                  </span>
                </th>
                <th className="px-4 py-3 font-medium">Длит.</th>
                <th className="px-4 py-3 font-medium">Результат</th>
                <th className="px-4 py-3 text-right font-medium">Действие</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((c) => (
                <tr
                  key={c.id}
                  onClick={() => setOpen(c)}
                  className="cursor-pointer select-none border-b border-line/50 transition-colors last:border-0 hover:bg-ink-600/40"
                >
                  <td className="whitespace-nowrap px-4 py-3 text-muted">
                    {formatDt(c.datetime)}
                    {c.isTest && (
                      <span className="ml-2 rounded bg-amber-500/15 px-1.5 py-0.5 text-[10px] font-medium text-amber-300">
                        тест
                      </span>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-muted">{c.phoneMasked}</td>
                  <td className="px-4 py-3 text-fg">{c.topic}</td>
                  <td className="px-4 py-3">
                    <ClsBadge cls={c.classification} />
                  </td>
                  <td className="px-4 py-3">
                    {c.escalated ? (
                      <span className="inline-flex flex-col">
                        <span className="text-amber-300">Да</span>
                        <span className="text-[11px] text-faint">{c.escalationReason}</span>
                      </span>
                    ) : (
                      <span className="text-faint">Нет</span>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-muted">{fmtDuration(c.durationSec)}</td>
                  <td className="px-4 py-3">
                    {c.crmResult ? (
                      <span className="text-brand-cyan">{c.crmResult}</span>
                    ) : (
                      <span className="text-faint">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpen(c);
                      }}
                      className="btn-ghost !px-3 !py-1.5 text-xs"
                    >
                      Открыть
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {open && <CallDrawer call={open} onClose={() => setOpen(null)} />}
    </div>
  );
}

function formatDt(iso: string): string {
  const [d, t] = iso.split("T");
  const [, m, day] = d.split("-");
  return `${day}.${m} ${t.slice(0, 5)}`;
}

const CLS_STYLE: Record<string, string> = {
  target: "border-brand-purple/40 text-brand-purple",
  repeat: "border-brand-indigo/40 text-brand-indigo",
  bought: "border-brand-cyan/40 text-brand-cyan",
  nontarget: "border-line text-faint",
};

function ClsBadge({ cls }: { cls: CallRecord["classification"] }) {
  return <span className={`pill ${CLS_STYLE[cls]}`}>{CLASSIFICATION_LABEL[cls]}</span>;
}

function CallDrawer({ call, onClose }: { call: CallRecord; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-40 flex justify-end" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div
        className="relative h-full w-full max-w-md overflow-y-auto border-l border-line bg-ink-800 p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <div>
            <div className="text-xs text-faint">Звонок {call.id}</div>
            <h3 className="mt-1 text-lg font-semibold text-fg">{call.topic}</h3>
            <div className="mt-1 text-sm text-muted">{formatDt(call.datetime)} · {call.phoneMasked}</div>
          </div>
          <button onClick={onClose} className="btn-ghost !p-2" aria-label="Закрыть">✕</button>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
          <Field label="Тип обращения"><ClsBadge cls={call.classification} /></Field>
          <Field label="Длительность">{fmtDuration(call.durationSec)}</Field>
          <Field label="Статус">
            {call.escalated ? (
              <span className="text-amber-300">Передан оператору</span>
            ) : (
              <span className="text-emerald-400">Закрыт ИИ</span>
            )}
          </Field>
          <Field label="Стоимость">{fmtMoney(call.cost)}</Field>
        </div>

        {call.escalated && (
          <div className="mt-4 rounded-xl border border-amber-500/25 bg-amber-500/[0.06] p-3 text-sm">
            <div className="text-xs text-faint">Причина эскалации</div>
            <div className="mt-0.5 text-amber-200">{call.escalationReason}</div>
          </div>
        )}

        {call.crmResult && (
          <div className="mt-4 rounded-xl border border-brand-cyan/25 bg-brand-cyan/[0.06] p-3 text-sm">
            <div className="text-xs text-faint">Результат в CRM</div>
            <div className="mt-0.5 text-brand-cyan">{call.crmResult}</div>
          </div>
        )}

        <div className="mt-5">
          <div className="mb-2 text-xs font-medium uppercase tracking-wide text-faint">Расшифровка диалога</div>
          <div className="space-y-2.5 text-sm">
            <Bubble who="Ассистент" text="Ресторан «Рыба моя», здравствуйте! Чем могу помочь?" />
            <Bubble who="Клиент" mine text="Хочу забронировать стол на двоих на сегодня вечером." />
            <Bubble who="Ассистент" text="С удовольствием. На какое время вам удобно?" />
            <Bubble who="Клиент" mine text="Часов на восемь." />
            <Bubble who="Ассистент" text="Готово, стол на двоих сегодня в 20:00 забронирован. Ждём вас!" />
          </div>
          <p className="mt-3 text-center text-[11px] text-faint">
            Демонстрационная расшифровка (прототип)
          </p>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-line bg-ink-700/50 p-3">
      <div className="text-xs text-faint">{label}</div>
      <div className="mt-1 font-medium text-fg">{children}</div>
    </div>
  );
}

function Bubble({ who, text, mine }: { who: string; text: string; mine?: boolean }) {
  return (
    <div className={`flex ${mine ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[80%] rounded-2xl px-3.5 py-2 ${
          mine
            ? "rounded-br-sm bg-brand-gradient text-white"
            : "rounded-bl-sm border border-line bg-ink-700 text-muted"
        }`}
      >
        <div className={`mb-0.5 text-[10px] ${mine ? "text-white/70" : "text-faint"}`}>{who}</div>
        {text}
      </div>
    </div>
  );
}
