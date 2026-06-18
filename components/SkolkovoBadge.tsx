import Image from "next/image";

// Логотип «Sk Участник» (статус участника «Сколково»). Официальный файл из брендбука, без перерисовки.
// Сайдбар тёмный в обеих темах → всегда зелёная версия. Паддинги (12 px) — охранное поле (> ~1/32 ширины).
export function SkolkovoBadge({ className = "" }: { className?: string }) {
  return (
    <a
      href="https://sk.ru"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Участник «Сколково»"
      title="Участник «Сколково»"
      className={`flex w-full items-center justify-center rounded-xl px-3 py-3 transition-colors hover:bg-ink-600/40 ${className}`}
    >
      <Image
        src="/skolkovo-resident-h-green.png"
        alt="Участник Сколково"
        width={907}
        height={206}
        priority
        className="w-full h-auto max-w-[210px]"
      />
    </a>
  );
}
