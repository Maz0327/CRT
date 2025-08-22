import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./client/index.html",
    "./client/src/ui-v2/**/*.{ts,tsx,js,jsx}",
    "./client/src/components/ui/**/*.{ts,tsx,js,jsx}"
  ],
  theme: { extend: {} },
  plugins: [],
} satisfies Config;