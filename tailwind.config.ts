import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Базовые поверхности — через CSS-переменные (тёмная/светлая темы).
        // Формат rgb(var() / <alpha-value>) сохраняет модификаторы прозрачности (/70 и т.п.).
        ink: {
          900: "rgb(var(--ink-900) / <alpha-value>)",
          800: "rgb(var(--ink-800) / <alpha-value>)",
          700: "rgb(var(--ink-700) / <alpha-value>)",
          600: "rgb(var(--ink-600) / <alpha-value>)",
          500: "rgb(var(--ink-500) / <alpha-value>)",
        },
        line: "rgb(var(--line) / <alpha-value>)",
        // Основной цвет текста (тёмный на светлой теме / светлый на тёмной)
        fg: "rgb(var(--fg) / <alpha-value>)",
        muted: "rgb(var(--muted) / <alpha-value>)",
        faint: "rgb(var(--faint) / <alpha-value>)",
        // Акценты из визитки: фиолетовый -> синий -> циан (одинаковы в обеих темах)
        brand: {
          purple: "#8b5cf6",
          violet: "#7c3aed",
          indigo: "#6366f1",
          blue: "#3b82f6",
          cyan: "#22d3ee",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      backgroundImage: {
        "brand-gradient":
          "linear-gradient(135deg, #8b5cf6 0%, #6366f1 45%, #22d3ee 100%)",
        "brand-soft":
          "linear-gradient(135deg, rgba(139,92,246,0.14) 0%, rgba(34,211,238,0.10) 100%)",
        "ink-radial":
          "radial-gradient(1200px 600px at 80% -10%, rgba(99,102,241,0.18), transparent 60%), radial-gradient(900px 500px at -10% 10%, rgba(139,92,246,0.12), transparent 55%)",
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(139,92,246,0.25), 0 12px 40px -12px rgba(99,102,241,0.45)",
        card: "0 1px 0 0 rgba(255,255,255,0.03) inset, 0 18px 40px -24px rgba(0,0,0,0.8)",
      },
      borderRadius: {
        xl2: "1.125rem",
      },
    },
  },
  plugins: [],
};

export default config;
