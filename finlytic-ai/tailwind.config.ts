import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: { 950: "#05060A", 900: "#0A0C12", 800: "#10131B", 700: "#171B26", 600: "#222837" },
        gold: { 300: "#F2DDA6", 400: "#E6C36A", 500: "#D4A945", 600: "#B28A2E" },
        pos: "#3DDC97",
        neg: "#FF5C6C",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        serif: ["var(--font-serif)", "Georgia", "Times New Roman", "serif"],
        mono: ["var(--font-mono)", "ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
      boxShadow: { glow: "0 0 0 1px rgba(230,195,106,.18), 0 30px 80px -20px rgba(212,169,69,.25)" },
      keyframes: { sweep: { "0%": { transform: "translateX(-100%)" }, "100%": { transform: "translateX(100%)" } }, pulseDot: { "0%,100%": { opacity: "1" }, "50%": { opacity: ".35" } } },
      animation: { sweep: "sweep 3.2s ease-in-out infinite", pulseDot: "pulseDot 1.6s ease-in-out infinite" },
    },
  },
  plugins: [],
};
export default config;
