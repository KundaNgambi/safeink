import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        dark: {
          bg: '#0f1117',
          card: 'rgba(26,30,42,0.85)',
          cardBorder: 'rgba(255,255,255,0.06)',
          text: '#f0f1f4',
          textSecondary: '#8b8fa3',
          textTertiary: '#555a6e',
          nav: 'rgba(18,20,30,0.9)',
        },
        light: {
          bg: '#F4F5F7',
          card: 'rgba(255,255,255,0.9)',
          cardBorder: 'rgba(0,0,0,0.06)',
          text: '#1a1c24',
          textSecondary: '#6b7080',
          textTertiary: '#9ca3af',
          nav: 'rgba(255,255,255,0.9)',
        },
        accent: {
          DEFAULT: '#BEFF46',
          dark: '#9BD42A',
          light: '#4CAF50',
          lightDark: '#388E3C',
        },
        danger: {
          DEFAULT: '#FF6B6B',
          light: '#EF5350',
        },
        info: {
          DEFAULT: '#5B9BFF',
          light: '#2979FF',
        },
      },
      fontFamily: {
        display: ['var(--font-bricolage)', 'sans-serif'],
        body: ['var(--font-manrope)', 'sans-serif'],
        mono: ['var(--font-jetbrains)', 'monospace'],
      },
      borderRadius: {
        '2xl': '20px',
        '3xl': '28px',
      },
      backdropBlur: {
        glass: '20px',
      },
    },
  },
  plugins: [],
};

export default config;
