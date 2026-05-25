/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  darkMode: ["class", "[data-theme='dark']"],
  theme: {
    extend: {
      colors: {
        // Backgrounds
        base: "var(--bg-base)",
        elevated: "var(--bg-elevated)",
        card: "var(--bg-card)",
        // Texts (também disponíveis como cores genéricas)
        primary: "var(--text-primary)",
        secondary: "var(--text-secondary)",
        muted: "var(--text-muted)",
        faint: "var(--text-faint)",
        // Semânticas
        gold: {
          DEFAULT: "var(--gold)",
          soft: "var(--gold-soft)",
          deep: "var(--gold-deep)",
        },
        accent: "var(--accent)",
        danger: "var(--danger)",
        warning: "var(--warning)",
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
