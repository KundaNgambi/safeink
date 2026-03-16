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
        prussian: '#1B263B',
        alabaster: '#E0E1DD',
        dark: {
          bg: '#1B263B',
          card: '#243447',
          cardBorder: 'rgba(224,225,221,0.1)',
          text: '#E0E1DD',
          textSecondary: 'rgba(224,225,221,0.6)',
          textTertiary: 'rgba(224,225,221,0.35)',
        },
        light: {
          bg: '#E0E1DD',
          card: '#FFFFFF',
          cardBorder: 'rgba(27,38,59,0.1)',
          text: '#1B263B',
          textSecondary: 'rgba(27,38,59,0.6)',
          textTertiary: 'rgba(27,38,59,0.35)',
        },
        danger: {
          DEFAULT: '#C45C6A',
        },
      },
      fontFamily: {
        display: ["'Plus Jakarta Sans'", 'sans-serif'],
        body: ["'Plus Jakarta Sans'", 'sans-serif'],
        mono: ["'JetBrains Mono'", 'monospace'],
      },
      borderRadius: {
        '2xl': '20px',
        '3xl': '28px',
      },
    },
  },
  plugins: [],
};

export default config;
