'use client';

import { useAppStore } from '@/store';
import { Plus } from 'lucide-react';

export default function FAB() {
  const { activeTab, selectedNoteId, setShowCreateNote, theme } = useAppStore();
  const isDark = theme === 'dark';

  if (activeTab !== 'notes' || selectedNoteId) return null;

  return (
    <button
      onClick={() => setShowCreateNote(true)}
      className="fixed z-50 flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95"
      style={{
        bottom: 84,
        right: 20,
        width: 54,
        height: 54,
        borderRadius: '50%',
        backgroundColor: isDark ? '#E0E1DD' : '#1B263B',
      }}
    >
      <Plus size={22} strokeWidth={1.5} style={{ color: isDark ? '#1B263B' : '#E0E1DD' }} />
    </button>
  );
}
