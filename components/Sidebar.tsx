"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "./Logo";
import { SkolkovoBadge } from "./SkolkovoBadge";
import { ThemeToggle } from "./ThemeToggle";
import { CLIENT, CONNECTED_ASSISTANTS } from "@/lib/mock";
import {
  IconHome,
  IconDashboard,
  IconDoc,
  IconMail,
} from "./icons";

type IconCmp = (p: { className?: string }) => JSX.Element;

// Группа «Управление»
const MANAGE: { href: string; label: string; Icon: IconCmp }[] = [
  { href: "/documents", label: "Фин. документы", Icon: IconDoc },
  { href: "/reports", label: "Отчёты", Icon: IconDashboard },
  { href: "/messages", label: "Отправить сообщение", Icon: IconMail },
];

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="px-3 pb-1.5 pt-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-faint">
      {children}
    </div>
  );
}

function NavItem({ href, label, Icon }: { href: string; label: string; Icon: IconCmp }) {
  const pathname = usePathname();
  const active = pathname === href || pathname.startsWith(href + "/");
  return (
    <Link
      href={href}
      className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
        active
          ? "bg-brand-soft text-fg shadow-[inset_0_0_0_1px_rgba(139,92,246,0.35)]"
          : "text-muted hover:bg-ink-600/50 hover:text-fg"
      }`}
    >
      <span
        className={`transition-colors ${
          active ? "text-brand-cyan" : "text-faint group-hover:text-brand-purple"
        }`}
      >
        <Icon />
      </span>
      {label}
      {active && (
        <span className="ml-auto h-1.5 w-1.5 rounded-full bg-brand-cyan shadow-[0_0_8px_2px_rgba(34,211,238,0.6)]" />
      )}
    </Link>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const onDashboard = pathname.startsWith("/dashboard");
  const initials = CLIENT.contactName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2);

  return (
    <aside className="sidebar fixed inset-y-0 left-0 z-30 flex w-64 flex-col border-r border-line bg-ink-800/95 backdrop-blur-md">
      <div className="px-5 pb-3 pt-2">
        <Logo />
      </div>

      <nav className="flex-1 space-y-4 overflow-y-auto px-3">
        {/* Главная */}
        <div className="space-y-1">
          <NavItem href="/home" label="Главная" Icon={IconHome} />
        </div>

        {/* Ассистенты — раздел со списком подключённых ассистентов (как «Подключённые услуги» в O'LINE) */}
        <div>
          <SectionLabel>Ассистенты</SectionLabel>
          <div className="space-y-1">
            {CONNECTED_ASSISTANTS.map((a) => {
              const launching = a.status === "launching";
              // Активный ассистент подсвечивается, когда открыт его дашборд
              const active = onDashboard && !launching;
              return (
                <Link
                  key={a.id}
                  href="/dashboard"
                  className={`group flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-all ${
                    active
                      ? "bg-brand-soft text-fg shadow-[inset_0_0_0_1px_rgba(139,92,246,0.3)]"
                      : "text-muted hover:bg-ink-600/50 hover:text-fg"
                  }`}
                >
                  <span
                    className={`h-2 w-2 shrink-0 rounded-full ${
                      launching ? "bg-amber-400" : "bg-emerald-400"
                    }`}
                  />
                  <span className="truncate">{a.name}</span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Управление */}
        <div>
          <SectionLabel>Управление</SectionLabel>
          <div className="space-y-1">
            {MANAGE.map((item) => (
              <NavItem key={item.href} {...item} />
            ))}
          </div>
        </div>

      </nav>

      <div className="space-y-2.5 p-3">
        {/* Бейдж резидента «Сколково» */}
        <SkolkovoBadge />

        {/* Тумблер темы оформления */}
        <ThemeToggle />

        {/* Профиль: имя, фамилия и компания — внизу */}
        <div className="flex items-center gap-3 rounded-xl border border-line bg-ink-700/60 p-3">
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-brand-gradient text-sm font-bold text-white">
            {initials}
          </div>
          <div className="min-w-0 leading-tight">
            <div className="truncate text-sm font-medium text-fg">{CLIENT.contactName}</div>
            <div className="truncate text-xs text-faint">{CLIENT.company}</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
