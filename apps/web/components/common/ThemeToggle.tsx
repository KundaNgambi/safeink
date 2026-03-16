'use client';

import { useAppStore } from '@/store';
import { useEffect } from 'react';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useAppStore();
  const isDark = theme === 'dark';

  useEffect(() => {
    document.body.className = theme;
  }, [theme]);

  return (
    <button
      onClick={toggleTheme}
      className="flex items-center gap-2 px-3 py-2 rounded-xl transition-all duration-200"
      style={{
        backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
      }}
      title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      <span className="text-lg">{isDark ? '🌙' : '☀️'}</span>
      <span
        className="text-xs font-body font-medium"
        style={{ color: isDark ? '#8b8fa3' : '#6b7080' }}
      >
        {isDark ? 'Dark' : 'Light'}
      </span>
    </button>
  );
}
