import Image from "next/image";

// Логотип КиберГусли. Официальный файл — чёрный артворк на прозрачном фоне.
// Сайдбар тёмный в обеих темах, поэтому подаём логотип белым через invert
// (красная точка при этом инвертируется в циановую — совпадает с брендовым акцентом).
export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <Image
      src="/cybergusli-logo.png"
      alt="КиберГусли — голосовые AI-ассистенты"
      width={1084}
      height={1075}
      priority
      className={`mx-auto h-auto w-full invert ${compact ? "max-w-[44px]" : "max-w-[150px]"}`}
    />
  );
}
