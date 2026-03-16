'use client';

import { useAppStore } from '@/store';
import { useEffect } from 'react';
import { Moon, Sun } from 'lucide-react';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useAppStore();
  const isDark = theme === 'dark';

  useEffect(() => {
    document.body.className = theme;
  }, [theme]);

  return (
    <button
      onClick={toggleTheme}
      className="flex items-center justify-center transition-all duration-200"
      style={{
        width: 36,
        height: 36,
        borderRadius: '50%',
        backgroundColor: isDark ? 'rgba(224,225,221,0.1)' : 'rgba(27,38,59,0.08)',
      }}
      title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      {isDark ? (
        <Sun size={16} strokeWidth={1.5} style={{ color: '#E0E1DD' }} />
      ) : (
        <Moon size={16} strokeWidth={1.5} style={{ color: '#1B263B' }} />
      )}
    </button>
  );
}
