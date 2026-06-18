import { InfoTip } from "../ui/Tooltip";

export function SectionCard({
  title,
  hint,
  right,
  children,
  className = "",
}: {
  title: string;
  hint?: string;
  right?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`card ${className}`}>
      <div className="mb-4 flex items-center gap-2">
        <h3 className="flex items-center gap-1.5 text-[15px] font-semibold text-fg">
          {title}
          {hint && <InfoTip text={hint} />}
        </h3>
        {right && <div className="ml-auto">{right}</div>}
      </div>
      {children}
    </section>
  );
}
