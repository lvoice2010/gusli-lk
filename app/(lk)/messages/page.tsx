"use client";

import { useState } from "react";
import { Topbar } from "@/components/Topbar";
import { CLIENT } from "@/lib/mock";
import { IconMail, IconPhone, IconCheck } from "@/components/icons";

const TOPICS = ["Вопрос по отчётам", "Изменить сценарий ассистента", "Биллинг и оплата", "Подключить услугу", "Другое"];

export default function MessagesPage() {
  const [topic, setTopic] = useState(TOPICS[0]);
  const [text, setText] = useState("");
  const [sent, setSent] = useState(false);

  return (
    <>
      <Topbar title="Отправить сообщение" subtitle="Напишите вашему менеджеру" />
      <div className="p-6">
        <div className="grid gap-5 lg:grid-cols-3">
          <div className="card lg:col-span-2">
            {sent ? (
              <div className="flex flex-col items-center gap-3 py-12 text-center">
                <div className="grid h-12 w-12 place-items-center rounded-full bg-emerald-500/15 text-emerald-400">
                  <IconCheck className="h-6 w-6" />
                </div>
                <div className="font-medium text-fg">Сообщение отправлено</div>
                <p className="max-w-sm text-sm text-faint">
                  {CLIENT.manager.name} ответит в рабочее время. Прототип — отправка
                  демонстрационная.
                </p>
                <button className="btn-ghost mt-2" onClick={() => { setSent(false); setText(""); }}>
                  Написать ещё
                </button>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setSent(true);
                }}
              >
                <label className="mb-1.5 block text-sm font-medium text-fg">Тема</label>
                <div className="mb-4 flex flex-wrap gap-2">
                  {TOPICS.map((t) => (
                    <button
                      type="button"
                      key={t}
                      onClick={() => setTopic(t)}
                      className={`pill ${
                        topic === t ? "border-brand-purple/60 text-fg" : "text-muted"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>

                <label className="mb-1.5 block text-sm font-medium text-fg">Сообщение</label>
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  rows={6}
                  placeholder="Опишите вопрос или задачу…"
                  className="w-full resize-none rounded-xl border border-line bg-ink-600/40 p-3 text-sm text-fg outline-none placeholder:text-faint focus:border-brand-purple/50"
                />
                <button type="submit" disabled={!text.trim()} className="btn-primary mt-4 disabled:opacity-50">
                  <IconMail className="h-4 w-4" /> Отправить менеджеру
                </button>
              </form>
            )}
          </div>

          <div className="card h-fit">
            <div className="text-sm font-semibold text-fg">Ваш менеджер</div>
            <div className="mt-3 flex items-center gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-brand-gradient text-sm font-bold text-white">
                {CLIENT.manager.name.split(" ").map((w) => w[0]).join("").slice(0, 2)}
              </div>
              <div>
                <div className="font-medium text-fg">{CLIENT.manager.name}</div>
                <div className="text-xs text-faint">КиберГусли</div>
              </div>
            </div>
            <div className="mt-4 space-y-2 text-sm">
              <a href={`tel:${CLIENT.manager.phone}`} className="flex items-center gap-2 text-muted hover:text-brand-cyan">
                <IconPhone className="h-4 w-4" /> {CLIENT.manager.phone}
              </a>
              <a href={`mailto:${CLIENT.manager.email}`} className="flex items-center gap-2 text-muted hover:text-brand-cyan">
                <IconMail className="h-4 w-4" /> {CLIENT.manager.email}
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
