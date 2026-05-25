"use client";

import { Sun, Moon } from "lucide-react";
import { useTheme } from "./ThemeProvider";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="relative w-10 h-10 rounded-full border border-default hover:border-strong flex items-center justify-center overflow-hidden"
      title={theme === "dark" ? "Tema claro" : "Tema escuro"}
      aria-label="Alternar tema"
    >
      <Sun
        size={16}
        className={`absolute transition-all duration-300 ${
          theme === "dark"
            ? "opacity-0 rotate-90 scale-50"
            : "opacity-100 rotate-0 scale-100 text-[var(--gold)]"
        }`}
      />
      <Moon
        size={16}
        className={`absolute transition-all duration-300 ${
          theme === "light"
            ? "opacity-0 -rotate-90 scale-50"
            : "opacity-100 rotate-0 scale-100 text-[var(--gold)]"
        }`}
      />
    </button>
  );
}
