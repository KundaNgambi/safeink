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

  const pillBg = isDark ? 'rgba(224,225,221,0.08)' : 'rgba(27,38,59,0.06)';
  const pillBorder = isDark ? 'rgba(224,225,221,0.12)' : 'rgba(27,38,59,0.1)';
  const iconColor = isDark ? '#E0E1DD' : '#1B263B';
  const textColor = isDark ? 'rgba(224,225,221,0.85)' : 'rgba(27,38,59,0.85)';
  const dangerAccent = '#C45C6A';

  return (
    <div
      className="fixed top-5 left-1/2 z-[9999] flex items-center gap-2.5 px-4 animate-slide-down"
      style={{
        transform: 'translateX(-50%)',
        height: 44,
        borderRadius: 22,
        background: pillBg,
        border: `1px solid ${pillBorder}`,
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        maxWidth: '90vw',
      }}
    >
      <AlertTriangle
        size={15}
        strokeWidth={1.5}
        className="flex-shrink-0"
        style={{ color: dangerAccent }}
      />
      <p
        className="text-xs font-medium truncate"
        style={{
          color: textColor,
          fontFamily: "'Plus Jakarta Sans', sans-serif",
        }}
      >
        {error}
      </p>
      <button
        onClick={clearError}
        className="flex-shrink-0 flex items-center justify-center transition-all duration-200"
        style={{
          width: 28,
          height: 28,
          borderRadius: '50%',
          background: isDark ? 'rgba(224,225,221,0.08)' : 'rgba(27,38,59,0.06)',
        }}
      >
        <X size={13} strokeWidth={1.5} style={{ color: iconColor, opacity: 0.6 }} />
      </button>
    </div>
  );
}
