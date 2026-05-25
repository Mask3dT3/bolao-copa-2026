/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  darkMode: ["class", "[data-theme='dark']"],
  theme: {
    extend: {
      colors: {
        // Cores via CSS variables (mudam com o tema)
        base: "var(--bg-base)",
        elevated: "var(--bg-elevated)",
        card: "var(--bg-card)",
        // Cores semânticas (fixas)
        gold: {
          DEFAULT: "var(--gold)",
          soft: "var(--gold-soft)",
          deep: "var(--gold-deep)",
        },
        accent: "var(--accent)",
        danger: "var(--danger)",
        warning: "var(--warning)",
      },
      textColor: {
        primary: "var(--text-primary)",
        secondary: "var(--text-secondary)",
        muted: "var(--text-muted)",
        faint: "var(--text-faint)",
      },
      borderColor: {
        default: "var(--border-default)",
        strong: "var(--border-strong)",
      },
      fontFamily: {
        display: ["Bebas Neue", "sans-serif"],
        body: ["Space Grotesk", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
        score: ["Oswald", "sans-serif"],
      },
    },
  },
  plugins: [],
};
