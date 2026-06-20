"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { InfoTip } from "@/components/ui/Tooltip";
import { IconDownload } from "@/components/icons";
import { PeriodSwitcher, type CustomRange } from "@/components/PeriodSwitcher";
import { getCalls, CLASSIFICATION_LABEL } from "@/lib/mock";
import { fmtDuration } from "@/lib/format";
import type { CallRecord, PeriodKey } from "@/lib/types";

type StatusFilter = "all" | "ai" | "esc";

// Журнал звонков (диалогов) ассистента — используется во вкладке «Диалоги».
export function CallsTable() {
  const all = useMemo(() => getCalls(), []);
  const [period, setPeriod] = useState<PeriodKey>("month");
  const [customRange, setCustomRange] = useState<CustomRange | null>(null);
  const [status, setStatus] = useState<StatusFilter>("all");
  const [q, setQ] = useState("");
  const [open, setOpen] = useState<CallRecord | null>(null);

  const query = q.trim().toLowerCase();
  const rows = all.filter((c) => {
    if (status === "ai" && c.escalated) return false;
    if (status === "esc" && !c.escalated) return false;
    if (query && !`${c.phoneMasked} ${c.topic}`.toLowerCase().includes(query)) return false;
    return true;
  });

  // Пагинация: по 20 записей на страницу
  const PER_PAGE = 20;
  const [page, setPage] = useState(1);
  useEffect(() => setPage(1), [status, query]); // сброс на 1-ю при смене фильтров
  const totalPages = Math.max(1, Math.ceil(rows.length / PER_PAGE));
  const safePage = Math.min(page, totalPages);
  const pageRows = rows.slice((safePage - 1) * PER_PAGE, safePage * PER_PAGE);

  return (
    <div className="space-y-4">
      {/* Фильтры */}
      <div className="flex flex-wrap items-center gap-3">
        <PeriodSwitcher
          value={period}
          onChange={setPeriod}
          customRange={customRange}
          onCustomRange={setCustomRange}
        />
        <div className="inline-flex items-center gap-1 rounded-xl border border-line bg-ink-700/70 p-1 text-sm">
          {([
            ["all", "Все"],
            ["ai", "Закрыто ИИ"],
            ["esc", "Эскалации"],
          ] as [StatusFilter, string][]).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setStatus(key)}
              className={`rounded-lg px-3 py-1.5 font-medium transition-colors ${
                status === key ? "bg-brand-gradient text-white" : "text-muted hover:text-fg"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="relative ml-auto w-full max-w-xs">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Номер, оператор или тема"
            className="w-full rounded-xl border border-line bg-ink-600/40 px-3.5 py-2 text-sm text-fg placeholder:text-faint focus:border-brand-purple focus:outline-none"
          />
        </div>
        <span className="w-full text-right text-xs text-faint sm:w-auto">
          Показано {rows.length} из {all.length}
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
                    <InfoTip text="Был ли диалог передан оператору и по какой причине." placement="bottom" />
                  </span>
                </th>
                <th className="px-4 py-3 font-medium">Длит.</th>
                <th className="px-4 py-3 font-medium">Результат</th>
                <th className="px-4 py-3 text-right font-medium">Действие</th>
              </tr>
            </thead>
            <tbody>
              {pageRows.map((c) => (
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

      {/* Пагинация */}
      {totalPages > 1 && (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="text-xs text-faint">
            Стр. {safePage} из {totalPages} · показано {pageRows.length} из {rows.length}
          </span>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={safePage === 1}
              className="btn-ghost !px-3 !py-1.5 text-sm disabled:opacity-40"
            >
              ← Назад
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
              <button
                key={n}
                onClick={() => setPage(n)}
                className={`h-8 w-8 rounded-lg text-sm font-medium transition-colors ${
                  n === safePage ? "bg-brand-gradient text-white" : "border border-line text-muted hover:text-fg"
                }`}
              >
                {n}
              </button>
            ))}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={safePage === totalPages}
              className="btn-ghost !px-3 !py-1.5 text-sm disabled:opacity-40"
            >
              Вперёд →
            </button>
          </div>
        </div>
      )}

      {open && <CallModal call={open} onClose={() => setOpen(null)} />}
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

// ── Демо-наполнение карточки вызова (прототип) ──
const CLIENT_NAMES = [
  "Захарова Екатерина", "Иванов Сергей", "Петрова Анна", "Кузнецов Дмитрий",
  "Смирнова Ольга", "Орлова Мария", "Лебедев Павел", "Новикова Дарья",
];

function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}
function pick<T>(arr: T[], id: string): T {
  return arr[hash(id) % arr.length];
}
function fullDt(iso: string): string {
  const [d, t] = iso.split("T");
  const [y, m, day] = d.split("-");
  return `${day}.${m}.${y} ${t.slice(0, 5)}:${("00").slice(0, 2)}`;
}

// ИИ-карточка: суть/категория из темы вызова
function aiCard(call: CallRecord): { cat: string; sub: string; summary: string; booking: boolean } {
  const t = call.topic.toLowerCase();
  const res = call.crmResult ? ` ${call.crmResult}.` : "";
  if (t.includes("брони") || t.includes("бронир"))
    return { cat: "Бронирование", sub: "Новая бронь", summary: `Гость забронировал стол.${res} Подтверждение отправлено.`, booking: true };
  if (t.includes("отмен") || t.includes("перенос"))
    return { cat: "Бронирование", sub: "Изменение брони", summary: `Гость перенёс/отменил бронь.${res} Изменение зафиксировано.`, booking: true };
  if (t.includes("меню") || t.includes("цен"))
    return { cat: "Информация", sub: "Меню и цены", summary: "Гость уточнил позиции меню и цены. Ответ дан из базы знаний.", booking: false };
  if (t.includes("час") || t.includes("адрес"))
    return { cat: "Информация", sub: "Часы работы / адрес", summary: "Гость уточнил часы работы и адрес заведения.", booking: false };
  if (t.includes("банкет"))
    return { cat: "Банкеты", sub: "Запрос по банкету", summary: "Гость интересовался условиями банкета и вместимостью залов.", booking: false };
  return { cat: "Прочее", sub: call.topic, summary: "Обращение обработано ассистентом.", booking: false };
}

function transcriptFor(call: CallRecord): { who: "a" | "c"; text: string; t: string }[] {
  if (aiCard(call).booking)
    return [
      { who: "a", text: "Ресторан «Рыба моя», здравствуйте! Меня зовут Марина. Чем помогу?", t: "00:00" },
      { who: "c", text: "Здравствуйте, хочу забронировать стол на сегодня вечером.", t: "00:05" },
      { who: "a", text: "С удовольствием. На сколько гостей и на какое время?", t: "00:11" },
      { who: "c", text: "На четверых, часов на восемь.", t: "00:18" },
      { who: "a", text: "Готово, забронировала стол на 4 гостей сегодня в 20:00. Ждём вас!", t: "00:26" },
      { who: "c", text: "Отлично, спасибо!", t: "00:33" },
      { who: "a", text: "Хорошего вечера, ждём вас!", t: "00:36" },
    ];
  return [
    { who: "a", text: "Ресторан «Рыба моя», здравствуйте! Чем могу помочь?", t: "00:00" },
    { who: "c", text: `Подскажите, ${call.topic.toLowerCase()}.`, t: "00:05" },
    { who: "a", text: "Секунду, уточню по базе знаний…", t: "00:09" },
    { who: "a", text: "Готово, всю информацию озвучила. Что-то ещё?", t: "00:20" },
    { who: "c", text: "Нет, всё понятно, спасибо!", t: "00:28" },
    { who: "a", text: "Хорошего дня, обращайтесь!", t: "00:31" },
  ];
}

function CallModal({ call, onClose }: { call: CallRecord; onClose: () => void }) {
  const card = aiCard(call);
  const clientName = pick(CLIENT_NAMES, call.id);
  const transcript = transcriptFor(call);
  const phoneDigits = call.phoneMasked.replace(/\D/g, "") || "79163114458";
  const [copied, setCopied] = useState(false);

  const downloadRec = () => {
    const blob = new Blob(
      [
        `Запись разговора (демо)\nВызов: ${call.id}\nДата: ${fullDt(call.datetime)}\nНомер: ${call.phoneMasked}\nТема: ${call.topic}\nДлительность: ${fmtDuration(call.durationSec)}`,
      ],
      { type: "text/plain;charset=utf-8" }
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `call-${call.id}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const copyLink = () => {
    const link = `${window.location.origin}/dashboard?call=${call.id}`;
    navigator.clipboard?.writeText(link).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };

  if (typeof document === "undefined") return null;
  return createPortal(
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4 backdrop-blur-sm" onClick={onClose}>
      <div
        className="flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-line bg-ink-800 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Шапка */}
        <div className="flex items-start justify-between gap-4 border-b border-line p-5">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-lg font-semibold text-fg">Просмотр вызова · {fullDt(call.datetime)}</h3>
              {call.escalated ? (
                <span className="pill border-amber-500/30 text-amber-300">Эскалация</span>
              ) : (
                <span className="pill border-emerald-500/30 text-emerald-400">Завершён</span>
              )}
            </div>
            <div className="mt-0.5 text-sm text-faint">Входящая линия «Рыба моя» · {call.topic}</div>
          </div>
          <button onClick={onClose} className="btn-ghost !p-2" aria-label="Закрыть">✕</button>
        </div>

        <div className="grid gap-5 overflow-y-auto p-5 lg:grid-cols-3">
          {/* Колонка 1 — информация о вызове */}
          <div>
            <ColTitle>Информация о вызове</ColTitle>
            <div className="divide-y divide-line/60 rounded-xl border border-line">
              <InfoRow label="UID вызова" value={call.id} mono />
              <InfoRow label="Номер звонящего" value={call.phoneMasked} />
              <InfoRow label="Номер назначения" value="242" />
              <InfoRow label="Линия" value="Входящая линия «Рыба моя»" />
              <InfoRow label="Ассистент" value="ИИ-ассистент «Марина»" />
              <InfoRow label="Ожидание ответа" value="менее 1 сек" />
              <InfoRow label="Длительность" value={fmtDuration(call.durationSec)} />
              <InfoRow label="Тема" value={call.topic} />
            </div>
          </div>

          {/* Колонка 2 — ИИ-карточка вызова (без блока соответствия скрипту) */}
          <div>
            <ColTitle accent>✨ ИИ-карточка вызова</ColTitle>
            <div className="space-y-3 rounded-xl border border-brand-cyan/30 bg-brand-cyan/[0.04] p-4 text-sm">
              <CardBlock label="ФИО клиента" value={clientName} />
              <CardBlock label="phone_number" value={phoneDigits} mono />
              <CardBlock label="Суть обращения" value={card.summary} />
              <CardBlock label="Категория" value={card.cat} />
              <CardBlock label="Подкатегория" value={card.sub} />
            </div>
          </div>

          {/* Колонка 3 — стенограмма */}
          <div>
            <ColTitle>Стенограмма</ColTitle>
            <div className="max-h-[440px] space-y-2.5 overflow-y-auto rounded-xl border border-line bg-ink-700/40 p-3 text-sm">
              {transcript.map((m, i) => (
                <Bubble key={i} who={m.who === "a" ? "Ассистент" : "Клиент"} mine={m.who === "c"} text={m.text} time={m.t} />
              ))}
            </div>
          </div>
        </div>

        {/* Запись разговора */}
        <div className="border-t border-line p-5">
          <ColTitle>🎧 Запись разговора</ColTitle>
          <div className="flex items-center gap-3 rounded-xl border border-line bg-ink-700/40 p-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-emerald-500 text-white">▶</span>
            <span className="shrink-0 text-xs tabular-nums text-faint">00:00</span>
            <div className="flex h-8 flex-1 items-center gap-0.5 overflow-hidden">
              {Array.from({ length: 64 }).map((_, i) => {
                const v = (hash(call.id + i) % 100) / 100;
                return (
                  <span
                    key={i}
                    className="w-1 shrink-0 rounded-full bg-faint/50"
                    style={{ height: `${20 + v * 70}%` }}
                  />
                );
              })}
            </div>
            <span className="shrink-0 text-xs tabular-nums text-faint">{fmtDuration(call.durationSec)}</span>
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <button onClick={downloadRec} className="btn-ghost !px-3 !py-1.5 text-xs">
              <IconDownload className="h-4 w-4" /> Скачать запись
            </button>
            <button onClick={copyLink} className="btn-ghost !px-3 !py-1.5 text-xs">
              {copied ? "Ссылка скопирована ✓" : "Скопировать ссылку"}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

function ColTitle({ children, accent }: { children: React.ReactNode; accent?: boolean }) {
  return (
    <div className={`mb-2.5 text-xs font-semibold uppercase tracking-wide ${accent ? "text-brand-cyan" : "text-faint"}`}>
      {children}
    </div>
  );
}

function InfoRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3 px-4 py-2.5 text-sm">
      <span className="shrink-0 text-faint">{label}</span>
      <span className={`min-w-0 truncate text-right text-fg ${mono ? "font-mono text-xs" : ""}`}>{value}</span>
    </div>
  );
}

function CardBlock({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <div className="text-xs font-medium text-faint">{label}</div>
      <div className={`mt-0.5 text-fg ${mono ? "font-mono" : ""}`}>{value}</div>
    </div>
  );
}

function Bubble({ who, text, mine, time }: { who: string; text: string; mine?: boolean; time?: string }) {
  return (
    <div className={`flex ${mine ? "justify-end" : "justify-start"}`}>
      <div className="max-w-[85%]">
        <div
          className={`rounded-2xl px-3.5 py-2 ${
            mine
              ? "rounded-br-sm bg-brand-gradient text-white"
              : "rounded-bl-sm border border-line bg-ink-700 text-muted"
          }`}
        >
          {text}
        </div>
        <div className={`mt-0.5 text-[10px] text-faint ${mine ? "text-right" : "text-left"}`}>
          {who}{time ? ` · ${time}` : ""}
        </div>
      </div>
    </div>
  );
}
