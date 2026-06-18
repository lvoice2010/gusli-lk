import Link from "next/link";
import { monthToPay } from "@/lib/mock";
import { fmtMoney } from "@/lib/format";
import { IconBell, IconFinance, IconWarn, IconArrowRight } from "./icons";

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

  return (
    <header className="sticky top-0 z-20 border-b border-line bg-ink-900/70 backdrop-blur-md">
      <div className="flex items-center gap-4 px-6 py-4">
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
                ? "border-amber-500/40 bg-amber-500/10 text-amber-400"
                : "border-brand-purple/40 text-fg"
            }`}
            title={hasDebt ? "Задолженность к оплате" : "Баланс"}
          >
            {hasDebt ? (
              <IconWarn className="h-4 w-4" />
            ) : (
              <IconFinance className="h-4 w-4 text-brand-cyan" />
            )}
            {fmtMoney(toPay)}
          </span>
          <button
            className="relative grid h-9 w-9 place-items-center rounded-xl border border-line bg-ink-700/70 text-muted transition-colors hover:text-fg"
            aria-label="Уведомления"
          >
            <IconBell className="h-5 w-5" />
            <span className="absolute -right-1 -top-1 grid h-4 w-4 place-items-center rounded-full bg-brand-gradient text-[10px] font-bold text-white">
              3
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}
