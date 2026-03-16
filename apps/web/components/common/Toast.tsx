'use client';

import { useEffect } from 'react';
import { useAppStore } from '@/store';
import { AlertTriangle, X } from 'lucide-react';

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

  const cardBg = isDark ? '#243447' : '#FFFFFF';
  const textColor = '#C45C6A';
  const borderColor = isDark ? 'rgba(196,92,106,0.25)' : 'rgba(196,92,106,0.2)';

  return (
    <div
      className="fixed top-4 left-1/2 -translate-x-1/2 z-[9999] px-5 py-3 rounded-2xl flex items-center gap-3 max-w-[90vw] animate-slide-down"
      style={{
        backgroundColor: cardBg,
        border: `1px solid ${borderColor}`,
        backdropFilter: 'blur(16px)',
      }}
    >
      <AlertTriangle
        size={16}
        strokeWidth={1.5}
        className="flex-shrink-0"
        style={{ color: textColor }}
      />
      <p
        className="text-sm flex-1 min-w-0 font-medium"
        style={{
          color: textColor,
          fontFamily: "'Plus Jakarta Sans', sans-serif",
        }}
      >
        {error}
      </p>
      <button
        onClick={clearError}
        className="flex-shrink-0 flex items-center justify-center rounded-lg transition-colors"
        style={{
          width: 28,
          height: 28,
          backgroundColor: isDark ? 'rgba(196,92,106,0.12)' : 'rgba(196,92,106,0.08)',
        }}
      >
        <X size={14} strokeWidth={1.5} style={{ color: textColor }} />
      </button>
    </div>
  );
}
