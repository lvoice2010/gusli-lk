"use client";

import { useEffect, useState } from "react";
import { IconPhone, IconHeadset } from "../icons";
import { CLIENT } from "@/lib/mock";

type CallState = "idle" | "connecting" | "live" | "ended";

function mmss(sec: number) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s < 10 ? "0" : ""}${s}`;
}

// Тест ассистента: звонок прямо в браузере. В прототипе звонок демонстрационный —
// имитируется соединение и разговор; при интеграции сюда подключается веб-звонок (WebRTC).
export function TestAssistant() {
  const [state, setState] = useState<CallState>("idle");
  const [sec, setSec] = useState(0);
  const [muted, setMuted] = useState(false);

  useEffect(() => {
    if (state === "connecting") {
      const t = setTimeout(() => setSec(0), 0);
      const c = setTimeout(() => setState("live"), 1600);
      return () => {
        clearTimeout(t);
        clearTimeout(c);
      };
    }
    if (state === "live") {
      const i = setInterval(() => setSec((s) => s + 1), 1000);
      return () => clearInterval(i);
    }
  }, [state]);

  const start = () => {
    setSec(0);
    setMuted(false);
    setState("connecting");
  };
  const end = () => setState("ended");
  const close = () => {
    setState("idle");
    setSec(0);
  };

  return (
    <>
      {/* CTA-карточка в шапке услуги */}
      <div className="flex min-w-[200px] flex-1 flex-col rounded-xl border border-brand-purple/30 bg-brand-soft p-4">
        <div className="text-[11px] font-semibold uppercase tracking-wide text-brand-purple">
          Демо
        </div>
        <div className="text-sm font-medium text-fg">Протестировать ассистента</div>
        <div className="mt-0.5 text-xs text-faint">Звонок прямо в браузере</div>
        <button onClick={start} className="btn-primary mt-2 self-start whitespace-nowrap text-sm">
          <IconPhone className="h-4 w-4" /> Позвонить
        </button>
      </div>

      {/* Модалка веб-звонка */}
      {state !== "idle" && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-[360px] max-w-full rounded-2xl border border-line bg-ink-800 p-6 text-center shadow-glow">
            {/* Аватар ассистента */}
            <div className="relative mx-auto mb-4 grid h-20 w-20 place-items-center rounded-full bg-brand-gradient text-white">
              <IconHeadset className="h-9 w-9" />
              {(state === "connecting" || state === "live") && (
                <span className="absolute inset-0 animate-ping rounded-full border-2 border-brand-cyan/50" />
              )}
            </div>

            <div className="text-base font-semibold text-fg">{CLIENT.assistantName}</div>
            <div className="mt-0.5 text-xs text-faint">Голосовой ассистент · веб-звонок</div>

            {/* Статус / таймер */}
            <div className="mt-3 text-sm">
              {state === "connecting" && <span className="text-muted">Соединение…</span>}
              {state === "live" && (
                <span className="font-medium text-emerald-400">В разговоре · {mmss(sec)}</span>
              )}
              {state === "ended" && (
                <span className="text-muted">Звонок завершён · {mmss(sec)}</span>
              )}
            </div>

            {/* Эквалайзер во время разговора */}
            {state === "live" && (
              <div className="mt-4 flex h-10 items-center justify-center gap-1">
                {[0, 1, 2, 3, 4, 5, 6].map((i) => (
                  <span
                    key={i}
                    className={`w-1.5 rounded-full bg-brand-cyan ${muted ? "" : "eqbar"}`}
                    style={{
                      height: 36,
                      animationDelay: `${i * 0.12}s`,
                      animationDuration: `${0.7 + (i % 3) * 0.2}s`,
                      transform: muted ? "scaleY(0.15)" : undefined,
                      opacity: muted ? 0.4 : 1,
                    }}
                  />
                ))}
              </div>
            )}

            {/* Управление */}
            <div className="mt-5 flex items-center justify-center gap-3">
              {state === "live" && (
                <button
                  onClick={() => setMuted((m) => !m)}
                  className={`grid h-12 w-12 place-items-center rounded-full border transition-colors ${
                    muted
                      ? "border-amber-500/40 bg-amber-500/15 text-amber-400"
                      : "border-line bg-ink-600/60 text-muted hover:text-fg"
                  }`}
                  title={muted ? "Включить микрофон" : "Выключить микрофон"}
                >
                  <MicIcon muted={muted} />
                </button>
              )}

              {state === "ended" ? (
                <>
                  <button onClick={start} className="btn-primary">
                    <IconPhone className="h-4 w-4" /> Позвонить ещё раз
                  </button>
                  <button onClick={close} className="btn-ghost">
                    Закрыть
                  </button>
                </>
              ) : (
                <button
                  onClick={end}
                  className="grid h-12 w-12 place-items-center rounded-full bg-rose-500 text-white transition-colors hover:bg-rose-600"
                  title="Завершить звонок"
                >
                  <IconPhone className="h-5 w-5 rotate-[135deg]" />
                </button>
              )}
            </div>

            <p className="mt-4 text-[11px] leading-snug text-faint">
              Демонстрационный звонок в браузере. После интеграции здесь идёт реальный разговор
              с настроенным ассистентом.
            </p>
          </div>
        </div>
      )}
    </>
  );
}

function MicIcon({ muted }: { muted: boolean }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
      <rect x="9" y="3" width="6" height="11" rx="3" />
      <path d="M5 11a7 7 0 0 0 14 0M12 18v3" strokeLinecap="round" />
      {muted && <path d="M4 4l16 16" strokeLinecap="round" />}
    </svg>
  );
}
