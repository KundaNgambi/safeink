export const darkTheme = {
  bg: '#0f1117',
  card: 'rgba(26,30,42,0.85)',
  cardBorder: 'rgba(255,255,255,0.06)',
  text: '#f0f1f4',
  textSecondary: '#8b8fa3',
  textTertiary: '#555a6e',
  accent: '#BEFF46',
  accentDark: '#9BD42A',
  accentFg: '#0f1117',
  danger: '#FF6B6B',
  blue: '#5B9BFF',
  nav: 'rgba(18,20,30,0.9)',
  overlay: 'rgba(0,0,0,0.6)',
};

export const lightTheme = {
  bg: '#F4F5F7',
  card: 'rgba(255,255,255,0.9)',
  cardBorder: 'rgba(0,0,0,0.06)',
  text: '#1a1c24',
  textSecondary: '#6b7080',
  textTertiary: '#9ca3af',
  accent: '#4CAF50',
  accentDark: '#388E3C',
  accentFg: '#ffffff',
  danger: '#EF5350',
  blue: '#2979FF',
  nav: 'rgba(255,255,255,0.9)',
  overlay: 'rgba(0,0,0,0.4)',
};

export type Theme = typeof darkTheme;
