import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#0B6FD1",
        accent: "#0E9F8E",
        canvas: "#EDF5FF",
        ink: "#0F1B2D",
        secondary: "#4A5A70",
      },
      borderRadius: {
        card: "12px",
      },
    },
  },
  plugins: [],
};

export default config;
