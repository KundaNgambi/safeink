'use client';

import { useEffect, useCallback } from 'react';
import { useAppStore } from '@/store';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export default function Modal({ isOpen, onClose, title, children }: ModalProps) {
  const theme = useAppStore((s) => s.theme);
  const isDark = theme === 'dark';

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center fade-in">
      {/* Overlay */}
      <div
        className="absolute inset-0"
        style={{
          backgroundColor: isDark ? 'rgba(0,0,0,0.6)' : 'rgba(0,0,0,0.4)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
        }}
        onClick={onClose}
      />
      {/* Modal content */}
      <div
        className="relative w-full max-w-lg max-h-[85vh] overflow-auto modal-slide-up"
        style={{
          backgroundColor: isDark ? '#0D1B2A' : '#F8F7F4',
          borderRadius: '28px 28px 0 0',
        }}
      >
        {/* Drag indicator */}
        <div className="flex justify-center pt-3 pb-1">
          <div
            className="rounded-full"
            style={{
              width: 40,
              height: 4,
              backgroundColor: isDark ? '#415A77' : '#778DA9',
            }}
          />
        </div>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-3">
          <h2
            className="text-xl font-[800]"
            style={{ fontFamily: 'var(--font-bricolage)', color: isDark ? '#E0E1DD' : '#0D1B2A' }}
          >
            {title}
          </h2>
          <button
            onClick={onClose}
            className="flex items-center justify-center transition-colors"
            style={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              backgroundColor: isDark ? 'rgba(119,141,169,0.15)' : 'rgba(13,27,42,0.08)',
              color: isDark ? '#778DA9' : '#415A77',
            }}
          >
            ✕
          </button>
        </div>
        {/* Body */}
        <div className="px-6 pb-8">{children}</div>
      </div>
    </div>
  );
}
