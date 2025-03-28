/** @type {import('tailwindcss').Config} */

import animatePlugin from "tailwindcss-animate";
import { extendedTheme } from "./app/utils/extended-theme";
import { marketingPreset } from "./app/utils/tailwind-preset";

export default {
  content: ["./app/**/*.{ts,tsx,jsx,js}"],
  darkMode: "class",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: extendedTheme,
  },
  presets: [marketingPreset],
  plugins: [animatePlugin],
};
