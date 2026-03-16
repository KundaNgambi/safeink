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
          bg: '#0D1B2A',
          card: '#1B263B',
          cardBorder: 'rgba(119,141,169,0.15)',
          surface: '#243447',
          text: '#E0E1DD',
          textSecondary: '#778DA9',
          textTertiary: '#415A77',
          nav: 'rgba(13,27,42,0.95)',
        },
        light: {
          bg: '#F8F7F4',
          card: '#FFFFFF',
          cardBorder: 'rgba(13,27,42,0.08)',
          text: '#0D1B2A',
          textSecondary: '#415A77',
          textTertiary: '#778DA9',
          nav: 'rgba(248,247,244,0.95)',
        },
        accent: {
          DEFAULT: '#F4A261',
          dark: '#E09049',
          light: '#E09049',
          lightDark: '#C47A38',
        },
        danger: {
          DEFAULT: '#E07A8E',
          light: '#C45C6A',
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
        serif: ['var(--font-serif)', 'serif'],
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
