import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "КиберГусли — Личный кабинет",
  description:
    "Личный кабинет клиента CyberGusli: отчётность по голосовому AI-ассистенту",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <head>
        {/* Тема по умолчанию — светлая; тёмная только если выбрана явно. Применяем до отрисовки — без мигания */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');if(t!=='dark')document.documentElement.setAttribute('data-theme','light');}catch(e){document.documentElement.setAttribute('data-theme','light');}})();`,
          }}
        />
      </head>
      <body className="min-h-screen bg-ink-900 bg-ink-radial font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
