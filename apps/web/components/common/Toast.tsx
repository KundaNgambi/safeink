'use client';

import { useEffect } from 'react';
import { useAppStore } from '@/store';

export default function Toast() {
  const { error, clearError, theme } = useAppStore();
  const isDark = theme === 'dark';

  useEffect(() => {
    if (error) {
      const timer = setTimeout(clearError, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, clearError]);

  if (!error) return null;

  return (
    <div
      className="fixed top-4 left-1/2 -translate-x-1/2 z-[9999] px-5 py-3 rounded-2xl flex items-center gap-3 shadow-lg animate-slide-down max-w-[90vw]"
      style={{
        backgroundColor: isDark ? 'rgba(255,107,107,0.15)' : 'rgba(255,107,107,0.1)',
        border: '1px solid rgba(255,107,107,0.3)',
        backdropFilter: 'blur(20px)',
      }}
    >
      <span className="text-base flex-shrink-0">⚠️</span>
      <p
        className="text-sm font-body flex-1 min-w-0"
        style={{
          color: '#FF6B6B',
          fontFamily: 'var(--font-manrope)',
        }}
      >
        {error}
      </p>
      <button
        onClick={clearError}
        className="flex-shrink-0 text-xs font-bold px-2 py-1 rounded-lg transition-colors hover:bg-white/10"
        style={{ color: '#FF6B6B', fontFamily: 'var(--font-manrope)' }}
      >
        ✕
      </button>
    </div>
  );
}
