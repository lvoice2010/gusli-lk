"use client";

import { useState } from "react";
import { IconCheck } from "@/components/icons";

// Форма «Подключить услугу» — название услуги, комментарий, срочность.
export function ConnectModal({ title, onClose }: { title: string; onClose: () => void }) {
  const [comment, setComment] = useState("");
  const [urgency, setUrgency] = useState("asap");
  const [sent, setSent] = useState(false);

  const URGENCY: [string, string][] = [
    ["asap", "Как можно скорее"],
    ["month", "В течение месяца"],
    ["interest", "Просто интересно"],
  ];

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md overflow-hidden rounded-2xl border border-line bg-ink-800 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-line p-5">
          <h3 className="text-lg font-semibold text-fg">Подключить услугу</h3>
          <button onClick={onClose} className="btn-ghost !p-2" aria-label="Закрыть">✕</button>
        </div>

        {sent ? (
          <div className="space-y-4 p-6 text-center">
            <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-emerald-500/15 text-emerald-400">
              <IconCheck className="h-6 w-6" />
            </div>
            <div>
              <div className="font-semibold text-fg">Заявка отправлена</div>
              <p className="mt-1 text-sm text-muted">
                Менеджер свяжется с вами по услуге «{title}».
              </p>
            </div>
            <button onClick={onClose} className="btn-ghost w-full">Закрыть</button>
          </div>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setSent(true);
            }}
            className="space-y-4 p-5"
          >
            <div>
              <label className="text-sm font-medium text-fg">Услуга</label>
              <div className="mt-1.5 rounded-xl border border-brand-purple/30 bg-brand-soft px-3.5 py-2.5 text-sm text-fg">
                {title}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-fg">Комментарий</label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={3}
                placeholder="Опишите задачу или вопрос"
                className="mt-1.5 w-full resize-none rounded-xl border border-line bg-ink-600/40 px-3.5 py-2.5 text-sm text-fg placeholder:text-faint focus:border-brand-purple focus:outline-none"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-fg">Срочность</label>
              <div className="mt-2 space-y-2">
                {URGENCY.map(([val, label]) => (
                  <label key={val} className="flex cursor-pointer items-center gap-2 text-sm text-muted">
                    <input
                      type="radio"
                      name="urgency"
                      checked={urgency === val}
                      onChange={() => setUrgency(val)}
                      className="h-4 w-4 accent-brand-purple"
                    />
                    {label}
                  </label>
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="w-full rounded-xl bg-brand-gradient px-4 py-3 text-sm font-semibold text-white shadow-glow transition-opacity hover:opacity-90"
            >
              Отправить заявку
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
