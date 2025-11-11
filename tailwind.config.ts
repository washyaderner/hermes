import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0a0014", // velvety black
        surface: "#1a0f2e", // deep purple-black
        primary: {
          DEFAULT: "#6b46c1", // dream purple
          foreground: "#e2e8f0",
        },
        accent: {
          DEFAULT: "#f97316", // molten core orange
          foreground: "#e2e8f0",
        },
        muted: {
          DEFAULT: "#64748b", // gray-purple
          foreground: "#e2e8f0",
        },
        foreground: "#e2e8f0", // soft white
        border: "#2d1f4a",
        input: "#2d1f4a",
        ring: "#6b46c1",
      },
      borderRadius: {
        lg: "0.75rem",
        md: "0.5rem",
        sm: "0.25rem",
      },
    },
  },
  plugins: [],
};

export default config;
