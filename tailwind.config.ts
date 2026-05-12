import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      colors: {
        legacy: {
          black: "#060606",
          ink: "#0d0d10",
          gold: "#d9b76c",
          pearl: "#f5efe2",
          smoke: "#9b958d",
        },
      },
      boxShadow: {
        glow: "0 0 90px rgba(217, 183, 108, 0.18)",
      },
    },
  },
  plugins: [],
};

export default config;
