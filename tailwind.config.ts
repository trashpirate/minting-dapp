import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      screens: {
        xxs: "274px",
        xs: "465px",
        "3xl": "1800px",
      },
      boxShadow: {
        "inner-sym": "inset 0px 0px 5px 0px #FF6B10",
      },
      dropShadow: {
        text: "2px 2px 2px #FF6B10",
      },
      backgroundImage: {
        "hero-pattern": "url('/banner.jpg')",
      },
      colors: {
        bgColor: "#000000",
        textColor: "#ffffff",
        primary: "#2F34EA",
        secondary: "#5CBCEF",
        button: "#fff",
      },
    },
  },
  plugins: [],
};
export default config;
