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
          backgroundColor: isDark ? '#0f1117' : '#F4F5F7',
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
              backgroundColor: isDark ? '#555a6e' : '#9ca3af',
            }}
          />
        </div>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-3">
          <h2
            className="text-xl font-[800]"
            style={{ fontFamily: 'var(--font-bricolage)', color: isDark ? '#f0f1f4' : '#1a1c24' }}
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
              backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
              color: isDark ? '#8b8fa3' : '#6b7080',
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
