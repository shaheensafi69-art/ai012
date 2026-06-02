import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        'safi-gold': '#D4AF37', // طلایی کلاسیک
        'safi-black': '#0A0A0A', // مشکی عمیق
        'safi-dark-gray': '#1A1A1A',
      },
      animation: {
        shimmer: 'shimmer 2s linear infinite',
      },
      keyframes: {
        shimmer: {
          from: { transform: 'translateX(-100%)' },
          to: { transform: 'translateX(200%)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;