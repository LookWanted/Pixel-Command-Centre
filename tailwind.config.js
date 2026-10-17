/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        palette: {
          coolWhite: "#D7E8FA",
          charcoal: "#1E222B",
          charcoalLight: "#2A303C",
          charcoalDark: "#12161F",
          charcoalDeep: "#0A0D14",
          limeGreen: "#5DF9C0",
          limeGreenDark: "#10b981",
          oceanBlue: "#3B1EFF",
          oceanBlueLight: "#6352FF",
          combatRed: "#FF2B44",
          combatRedDark: "#DC2626",
          gold: "#FBBF24"
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      }
    },
  },
  plugins: [],
}
