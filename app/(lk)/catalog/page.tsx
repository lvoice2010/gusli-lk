import { Topbar } from "@/components/Topbar";
import {
  IconAssistant,
  IconShield,
  IconWave,
  IconDashboard,
  IconSparkle,
  IconCheck,
  IconArrowRight,
} from "@/components/icons";

type Status = "connected" | "available" | "soon";

const SERVICES: {
  label: string;
  title: string;
  desc: string;
  price: string;
  status: Status;
  Icon: (p: { className?: string }) => JSX.Element;
  accent: string;
}[] = [
  {
    label: "Голос · входящая линия",
    title: "Голосовой ассистент на вход",
    desc: "Принимает звонки 24/7, отвечает на вопросы, бронирует и записывает. Поминутная тарификация.",
    price: "Поминутно · единый тариф",
    status: "connected",
    Icon: IconAssistant,
    accent: "#8b5cf6",
  },
  {
    label: "Голос · входящая линия",
    title: "Вторая линия — банкеты",
    desc: "Отдельный ассистент под мероприятия и банкеты, чтобы разгрузить основную линию.",
    price: "Поминутно · единый тариф",
    status: "connected",
    Icon: IconAssistant,
    accent: "#6366f1",
  },
  {
    label: "Качество",
    title: "Контроль качества звонков",
    desc: "Оценим диалоги по вашему чек-листу, покажем проблемные места и точки роста.",
    price: "Бесплатно в первый месяц",
    status: "available",
    Icon: IconShield,
    accent: "#22d3ee",
  },
  {
    label: "Аналитика",
    title: "Ежеквартальный ИИ-отчёт",
    desc: "Карта проблем по обращениям и рекомендации с прогнозом роста продаж на 15–25%.",
    price: "По подписке",
    status: "available",
    Icon: IconWave,
    accent: "#8b5cf6",
  },
  {
    label: "Аналитика",
    title: "Расширенная аналитика",
    desc: "Глубокие срезы, выгрузки и API отчётности для интеграции в ваши дашборды.",
    price: "По запросу",
    status: "available",
    Icon: IconDashboard,
    accent: "#3b82f6",
  },
  {
    label: "Скоро",
    title: "Исходящие кампании",
    desc: "Ассистент сам обзванивает базу: подтверждения, напоминания, реактивация. В разработке.",
    price: "—",
    status: "soon",
    Icon: IconSparkle,
    accent: "#5d5d75",
  },
];

const STATUS: Record<Status, { label: string; cls: string }> = {
  connected: { label: "Подключено", cls: "border-emerald-500/30 text-emerald-400" },
  available: { label: "Доступно", cls: "border-brand-purple/40 text-brand-purple" },
  soon: { label: "Скоро", cls: "border-line text-faint" },
};

export default function CatalogPage() {
  return (
    <>
      <Topbar
        title="Витрина услуг"
        subtitle="Все продукты и услуги КиберГусли — входящие линии, аналитика, контроль качества"
      />
      <div className="p-6">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {SERVICES.map((s) => {
            const st = STATUS[s.status];
            return (
              <div key={s.title} className="card flex flex-col">
                <div className="flex items-start justify-between">
                  <span
                    className="grid h-11 w-11 place-items-center rounded-xl text-white"
                    style={{ background: `linear-gradient(135deg, ${s.accent}, #22d3ee)` }}
                  >
                    <s.Icon className="h-6 w-6" />
                  </span>
                  <span className={`pill ${st.cls}`}>
                    {s.status === "connected" && <IconCheck className="h-3 w-3" />}
                    {st.label}
                  </span>
                </div>
                <div className="mt-3 text-[11px] font-semibold uppercase tracking-wide text-faint">
                  {s.label}
                </div>
                <h3 className="mt-1 font-semibold text-fg">{s.title}</h3>
                <p className="mt-1 flex-1 text-sm leading-relaxed text-muted">{s.desc}</p>
                <div className="mt-3 text-sm font-medium text-fg">{s.price}</div>
                <div className="mt-4 flex items-center gap-2">
                  {s.status === "connected" ? (
                    <button className="btn-ghost text-sm">Управление</button>
                  ) : s.status === "soon" ? (
                    <button className="btn-ghost cursor-default text-sm opacity-60" disabled>
                      Скоро
                    </button>
                  ) : (
                    <>
                      <button className="btn-primary text-sm">
                        Подключить <IconArrowRight className="h-3.5 w-3.5" />
                      </button>
                      <button className="btn-ghost text-sm">Демо</button>
                    </>
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
