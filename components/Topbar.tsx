"use client";

import Link from "next/link";
import { monthToPay } from "@/lib/mock";
import { fmtMoney } from "@/lib/format";
import { IconFinance, IconWarn, IconArrowRight } from "./icons";
import { useMobileNav } from "./MobileNavContext";

export function Topbar({
  title,
  subtitle,
  actions,
  back,
}: {
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
  back?: { href: string; label: string };
}) {
  const toPay = monthToPay(); // к оплате за месяц: минуты × тариф + сопровождение
  const hasDebt = toPay > 0; // есть задолженность — подсвечиваем в шапке
  const { setOpen } = useMobileNav();

  return (
    <header className="sticky top-0 z-20 border-b border-line bg-ink-900/70 backdrop-blur-md">
      <div className="flex items-center gap-3 px-4 py-4 sm:gap-4 sm:px-6">
        {/* Бургер — открыть меню (моб.) */}
        <button
          onClick={() => setOpen(true)}
          aria-label="Меню"
          className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-line text-muted transition-colors hover:text-fg lg:hidden"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
            <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
          </svg>
        </button>
        <div className="min-w-0">
          {back && (
            <Link
              href={back.href}
              className="mb-0.5 inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-fg"
            >
              <IconArrowRight className="h-4 w-4 rotate-180" /> {back.label}
            </Link>
          )}
          {title && <h1 className="truncate text-lg font-semibold text-fg">{title}</h1>}
          {subtitle && <p className="truncate text-sm text-faint">{subtitle}</p>}
        </div>
        <div className="ml-auto flex items-center gap-3">
          {actions}
          <span
            className={`pill font-semibold ${
              hasDebt
                ? "border-transparent bg-amber-500 text-white shadow-sm"
                : "border-brand-purple/40 text-fg"
            }`}
            title={hasDebt ? "Задолженность к оплате" : "Баланс"}
          >
            <IconFinance className={`h-4 w-4 ${hasDebt ? "text-white" : "text-brand-cyan"}`} />
            {hasDebt ? "−" : ""}{fmtMoney(toPay)}
            {hasDebt && <IconWarn className="h-4 w-4" />}
          </span>
        </div>
      </div>
    </header>
  );
}
