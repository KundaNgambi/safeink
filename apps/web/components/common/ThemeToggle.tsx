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
        backgroundColor: isDark ? 'rgba(119,141,169,0.15)' : 'rgba(13,27,42,0.08)',
      }}
      title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      <span className="text-lg">{isDark ? '🌙' : '☀️'}</span>
      <span
        className="text-xs font-body font-medium"
        style={{ color: isDark ? '#778DA9' : '#415A77' }}
      >
        {isDark ? 'Dark' : 'Light'}
      </span>
    </button>
  );
}
