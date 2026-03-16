'use client';

import { useAppStore } from '@/store';

export default function FAB() {
  const { activeTab, selectedNoteId, setShowCreateNote, theme } = useAppStore();
  const isDark = theme === 'dark';

  if (activeTab !== 'notes' || selectedNoteId) return null;

  return (
    <button
      onClick={() => setShowCreateNote(true)}
      className="fixed z-40 flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95 fab-glow"
      style={{
        bottom: 88,
        right: 20,
        width: 56,
        height: 56,
        borderRadius: 18,
        background: `linear-gradient(135deg, ${isDark ? '#BEFF46' : '#4CAF50'}, ${isDark ? '#9BD42A' : '#388E3C'})`,
      }}
    >
      <span
        className="text-2xl font-bold"
        style={{ color: isDark ? '#0f1117' : '#ffffff' }}
      >
        +
      </span>
    </button>
  );
}
