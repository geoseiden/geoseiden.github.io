import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        main: "#76fbd9",
        bg: "#ffffff",
        text: "#000000",
        border: "#000000",
        darkBg: "#212121",
        darkText: "#eeefe9",
        secondaryBlack: "#212121",
        accent: "#2b55ff",
        accentDark: "#4b6fff",
      },
      borderRadius: {
        base: "5px",
      },
      boxShadow: {
        brutal: "4px 4px 0 0 #000",
        "brutal-lg": "8px 8px 0 0 #000",
        "brutal-xl": "12px 12px 0 0 #000",
        "brutal-dark": "4px 4px 0 0 #555555",
        "brutal-dark-lg": "8px 8px 0 0 #555555",
        "brutal-dark-xl": "12px 12px 0 0 #555555",
      },
      fontFamily: {
        sans: ["var(--font-space-grotesk)", "sans-serif"],
      },
      fontWeight: {
        base: "500",
      },
    },
  },
  plugins: [],
};

export default config;
