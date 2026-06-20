"use client";

import { useState } from "react";
import Link from "next/link";
import {
  IconDownload,
  IconCalendar,
  IconDashboard,
  IconWave,
  IconWarn,
  IconSparkle,
  IconInfo,
  IconCheck,
  IconDoc,
} from "@/components/icons";

// Демо квартального ИИ-отчёта — пример на обезличенных данных (ресторан · HoReCa).
// Ассистент принимает 100% звонков — это не «потерянные вызовы», а что ИИ выявил из принятых диалогов.
const QR_PROBLEMS = [
  { title: "Повторные звонки «подтвердите бронь»", count: 920, pct: 18, desc: "Гости перезванивают убедиться, что бронь в силе — нет проактивного подтверждения после оформления." },
  { title: "Отказы из-за неактуального стоп-листа", count: 760, pct: 15, desc: "Ассистент сообщал, что блюда нет в наличии; часть гостей в итоге не сделала заказ. Стоп-лист обновляется нерегулярно." },
  { title: "Вопросы без ответа в базе знаний", count: 560, pct: 11, desc: "По редким запросам (аллергены, спецусловия) ассистент передавал диалог оператору — этих ответов нет в базе." },
  { title: "Отмены и переносы броней", count: 520, pct: 10, desc: "Высокая доля переносов и неявок в выходные. Нет напоминаний и листа ожидания на популярные слоты." },
  { title: "Банкеты: интерес без заявки", count: 410, pct: 8, desc: "Гости спрашивали про банкеты, но без отдельного сценария заявка не доводилась до менеджера." },
];

const QR_RECS = [
  {
    title: "Автоматизировать подтверждение броней",
    impact: "+4–7% выручки",
    items: [
      "Запустить исходящие напоминания накануне визита.",
      "Авто-SMS с деталями брони сразу после звонка.",
      "Проактивное подтверждение за 2 часа до визита.",
    ],
  },
  {
    title: "Актуализировать меню и стоп-лист",
    impact: "+2–4% продаж",
    items: [
      "Ежедневное обновление стоп-листа в базе знаний.",
      "Добавить цены и состав по всем позициям меню.",
      "Предлагать альтернативу, когда блюда нет в наличии.",
    ],
  },
  {
    title: "Закрыть пробелы в базе знаний",
    impact: "−эскалации · +1–3%",
    items: [
      "Добавить ответы по аллергенам и составу блюд.",
      "Описать спецпредложения и условия акций.",
      "Расширить FAQ по частым редким вопросам.",
    ],
  },
  {
    title: "Снизить отмены и неявки",
    impact: "+3–6% выручки",
    items: [
      "Напоминания о брони с возможностью переноса.",
      "Лист ожидания на популярные слоты.",
      "Подтверждение брони в день визита.",
    ],
  },
  {
    title: "Развить банкетное направление",
    impact: "+5–9% заявок",
    items: [
      "Отдельный сценарий: залы, вместимость, депозиты.",
      "Мгновенная передача горячих заявок менеджеру банкетов.",
      "Авто-отправка коммерческого предложения по банкету.",
    ],
  },
];

export function QuarterReportDemo({ onClose, onConnect }: { onClose: () => void; onConnect?: () => void }) {
  const [done, setDone] = useState<Set<string>>(new Set());
  const toggle = (key: string) =>
    setDone((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });

  const max = Math.max(...QR_PROBLEMS.map((p) => p.count));
  const total = QR_RECS.reduce((s, g) => s + g.items.length, 0);
  const doneCount = done.size;
  const donePct = Math.round((doneCount / total) * 100);

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4 backdrop-blur-sm" onClick={onClose}>
      <div
        className="flex max-h-[94vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-line bg-ink-800 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Шапка */}
        <div className="flex items-start justify-between gap-4 border-b border-line p-5">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wide text-emerald-400">
              Демо · ежеквартальный ИИ-отчёт
            </div>
            <h3 className="mt-1 text-lg font-semibold text-fg">Пример отчёта на обезличенных данных</h3>
          </div>
          <button onClick={onClose} className="btn-ghost !p-2" aria-label="Закрыть">✕</button>
        </div>

        <div className="space-y-5 overflow-y-auto p-5">
          {/* Баннер-пояснение */}
          <div className="flex gap-2.5 rounded-xl border border-amber-500/25 bg-amber-500/[0.06] p-3 text-sm text-muted">
            <IconInfo className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
            <div>
              Это пример отчёта, который вы получите после подключения. Данные обезличены, взяты у
              клиента из сферы HoReCa за квартал. После подключения отчёт будет автоматически
              формироваться на ваших обращениях.
            </div>
          </div>

          {/* Карточка отчёта */}
          <div className="rounded-xl border border-line bg-ink-700/40 p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-wide text-emerald-400">
                  Ежеквартальный ИИ-отчёт
                </div>
                <h4 className="mt-1 text-xl font-bold text-fg">Рекомендации по улучшению сервиса · Q1 2026</h4>
              </div>
              <button onClick={() => window.print()} className="btn-ghost shrink-0 text-sm">
                <IconDownload className="h-4 w-4" /> Скачать PDF
              </button>
            </div>
            <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-sm text-muted">
              <span className="flex items-center gap-1.5">
                <IconCalendar className="h-4 w-4 text-faint" /> Период анализа: 01–31 марта 2026
              </span>
              <span className="flex items-center gap-1.5">
                <IconDashboard className="h-4 w-4 text-faint" /> Проанализировано: 5 240 обращений
              </span>
            </div>
            <p className="mt-1 text-sm text-faint">
              Ресторан · приём звонков и бронирований. Источник — обращения гостей на линию ассистента.
            </p>
            <p className="mt-3 border-t border-line pt-3 text-sm leading-relaxed text-muted">
              Ассистент принял 100% звонков за квартал и закрыл бóльшую часть без оператора. На основе
              всех диалогов выявлены темы и проблемы, влияющие на конверсию в брони и выручку, и
              предложены рекомендации с прогнозом эффекта.
            </p>
          </div>

          {/* Прогноз эффекта */}
          <div className="flex items-start gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/[0.06] p-4">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-emerald-500/15 text-emerald-400">
              <IconWave className="h-5 w-5" />
            </span>
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wide text-emerald-400">
                Прогноз эффекта при выполнении всех рекомендаций
              </div>
              <div className="mt-0.5 text-2xl font-bold text-fg">рост выручки +15–28%</div>
              <p className="mt-0.5 text-xs text-muted">
                Сумма потенциального эффекта по 5 направлениям. Реальный результат зависит от
                приоритизации и скорости внедрения изменений.
              </p>
            </div>
          </div>

          {/* Основные проблемы */}
          <div>
            <h4 className="mb-3 flex items-center gap-2 font-semibold text-fg">
              <IconWarn className="h-5 w-5 text-amber-400" /> Основные проблемы
            </h4>
            <div className="grid gap-3 md:grid-cols-2">
              {QR_PROBLEMS.map((p, i) => (
                <div key={p.title} className="rounded-xl border border-line bg-ink-700/40 p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2.5">
                      <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-amber-500/15 text-xs font-bold text-amber-400">
                        {i + 1}
                      </span>
                      <span className="font-semibold text-fg">{p.title}</span>
                    </div>
                    <div className="shrink-0 text-right">
                      <div className="text-lg font-bold text-fg">{p.count.toLocaleString("ru-RU")}</div>
                      <div className="text-[10px] uppercase tracking-wide text-faint">обращений</div>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-[11px] text-faint">
                    <span>Доля от всех обращений</span>
                    <span className="font-semibold text-fg">{p.pct}%</span>
                  </div>
                  <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-ink-500">
                    <div className="h-full rounded-full bg-amber-400" style={{ width: `${(p.count / max) * 100}%` }} />
                  </div>
                  <p className="mt-2 text-xs leading-relaxed text-muted">{p.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Рекомендации по улучшению */}
          <div>
            <div className="mb-3 flex items-center justify-between gap-3">
              <h4 className="flex items-center gap-2 font-semibold text-fg">
                <IconSparkle className="h-5 w-5 text-emerald-400" /> Рекомендации по улучшению
              </h4>
              <span className="shrink-0 text-xs text-faint">
                Выполнено: <span className="font-semibold text-fg">{doneCount} из {total}</span> ({donePct}%)
              </span>
            </div>
            <div className="mb-3 flex gap-2.5 rounded-lg border border-brand-cyan/20 bg-brand-cyan/[0.05] p-2.5 text-xs text-muted">
              <IconInfo className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-cyan" />
              Отмечайте выполненные пункты — на их основании мы исключим их из следующего анализа и
              оценим эффект на снижение обращений и рост продаж.
            </div>

            <div className="space-y-3">
              {QR_RECS.map((g, gi) => {
                const gDone = g.items.filter((_, ii) => done.has(`${gi}-${ii}`)).length;
                return (
                  <div key={g.title} className="rounded-xl border border-line bg-ink-700/40 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-2.5">
                        <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-emerald-500/15 text-xs font-bold text-emerald-400">
                          {gi + 1}
                        </span>
                        <div>
                          <div className="font-semibold text-fg">{g.title}</div>
                          <div className="text-xs text-faint">Выполнено: {gDone} из {g.items.length}</div>
                        </div>
                      </div>
                      <span className="shrink-0 rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-400">
                        {g.impact}
                      </span>
                    </div>
                    <div className="mt-3 space-y-2 border-t border-line pt-3">
                      {g.items.map((it, ii) => {
                        const key = `${gi}-${ii}`;
                        const checked = done.has(key);
                        return (
                          <label key={key} className="flex cursor-pointer items-start gap-2.5 text-sm">
                            <span
                              onClick={() => toggle(key)}
                              className={`mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded border transition-colors ${
                                checked ? "border-emerald-500 bg-emerald-500 text-white" : "border-line"
                              }`}
                            >
                              {checked && <IconCheck className="h-3 w-3" />}
                            </span>
                            <span className={checked ? "text-faint line-through" : "text-muted"}>{it}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Заключение */}
          <div className="rounded-xl border border-line bg-ink-700/40 p-4">
            <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-faint">
              <IconDoc className="h-4 w-4" /> Заключение
            </div>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              Ассистент уже снимает с операторов всю нагрузку на линии. Главные точки роста —
              автоматизировать подтверждение броней и закрыть пробелы в базе знаний: именно они дают
              больше всего повторных звонков, отказов и неявок. Реализация рекомендаций повысит
              заполняемость зала и средний чек, а отчёт следующего квартала покажет эффект на ваших данных.
            </p>
          </div>
        </div>

        {/* Футер */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line p-4">
          <span className="text-xs text-faint">Подключите услугу и получите такой же отчёт по своим обращениям</span>
          <div className="flex items-center gap-2">
            <button onClick={onClose} className="btn-ghost text-sm">Закрыть</button>
            {onConnect ? (
              <button onClick={onConnect} className="btn-primary text-sm">
                Подключить услугу
              </button>
            ) : (
              <Link href="/catalog" className="btn-primary text-sm">
                Подключить услугу
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
