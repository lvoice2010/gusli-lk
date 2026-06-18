import Link from "next/link";
import { Topbar } from "@/components/Topbar";
import { PulseDot } from "@/components/PulseDot";
import { IconAssistant, IconPhone, IconWave, IconArrowRight } from "@/components/icons";
import { fmtNumber } from "@/lib/format";
import { CONNECTED_ASSISTANTS } from "@/lib/mock";

type Item = {
  id: string;
  name: string;
  subtitle?: string;
  line: string;
  status: "active" | "launching" | "test";
  dialogs?: number;
  tariff: string;
  schedule?: string;
};

// Список подключённых ассистентов (+ тестовый, исключён из статистики)
const ITEMS: Item[] = [
  ...CONNECTED_ASSISTANTS.map((a) => ({
    id: a.id,
    name: a.name,
    subtitle: a.subtitle,
    line: a.line,
    status: a.status,
    dialogs: a.acceptedMonth,
    tariff: a.tariff,
    schedule: a.schedule,
  })),
  {
    id: "test-muha",
    name: "Тестовый ассистент Муха",
    line: "—",
    status: "test",
    dialogs: 37,
    tariff: "Песочница",
  },
];

const BADGE = {
  active: { label: "Активна", cls: "border-emerald-500/30 text-emerald-400", dot: "bg-emerald-400" },
  launching: { label: "В запуске", cls: "border-amber-500/30 text-amber-300", dot: "bg-amber-400" },
  test: { label: "Тестовый", cls: "border-line text-faint", dot: "bg-faint" },
};

export default function AssistantsPage() {
  return (
    <>
      <Topbar title="Ассистенты" subtitle="Ваши подключённые ассистенты" />
      <div className="space-y-4 p-6">
        <p className="text-sm text-faint">
          Тестовые ассистенты помечены и исключены из клиентской статистики. Оплата — по факту.
        </p>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {ITEMS.map((a) => {
            const b = BADGE[a.status];
            return (
              <div key={a.id} className="card flex flex-col gap-4">
                <div className="flex items-start gap-3">
                  <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-brand-soft text-brand-purple">
                    <IconAssistant />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate font-semibold text-fg">{a.name}</h3>
                    <p className="mt-0.5 text-sm text-faint">
                      {a.schedule ? `Работает ${a.schedule}` : a.subtitle ?? a.tariff}
                    </p>
                  </div>
                  <span className={`pill ${b.cls}`}>
                    {a.status === "active" ? (
                      <PulseDot />
                    ) : (
                      <span className={`h-2 w-2 rounded-full ${b.dot}`} />
                    )}{" "}
                    {b.label}
                  </span>
                </div>

                <div className="flex items-center gap-4 text-sm text-muted">
                  <span className="flex items-center gap-1.5">
                    <IconPhone className="h-4 w-4 text-faint" /> {a.line}
                  </span>
                  {a.status !== "launching" && (
                    <span className="flex items-center gap-1.5">
                      <IconWave className="h-4 w-4 text-faint" /> {fmtNumber(a.dialogs ?? 0)} диалогов
                    </span>
                  )}
                </div>

                <div className="mt-auto">
                  {a.status === "active" ? (
                    <Link
                      href="/dashboard"
                      className="flex items-center gap-1 text-sm font-medium text-brand-purple hover:text-brand-cyan"
                    >
                      Отчётность <IconArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  ) : a.status === "launching" ? (
                    <span className="text-sm text-faint">Запуск настраивается</span>
                  ) : (
                    <span className="text-sm text-faint">Тестовая среда</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
