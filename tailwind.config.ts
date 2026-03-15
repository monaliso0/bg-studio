import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      colors: {
        surface: "#FAFAFA",
        border: "#E5E5E5",
        muted: "#999999",
        ink: "#111111",
      },
    },
  },
  plugins: [],
};

export default config;
