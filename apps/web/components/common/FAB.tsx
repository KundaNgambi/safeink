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
        background: `linear-gradient(135deg, ${isDark ? '#F4A261' : '#E09049'}, ${isDark ? '#E09049' : '#C47A38'})`,
      }}
    >
      <span
        className="text-2xl font-bold"
        style={{ color: isDark ? '#0D1B2A' : '#FFFFFF' }}
      >
        +
      </span>
    </button>
  );
}
