'use client';

import { useAppStore } from '@/store';
import CopyButton from '@/components/common/CopyButton';
import type { NoteDecrypted } from '@safeink/shared';

interface NoteCardPinnedProps {
  note: NoteDecrypted;
}

export default function NoteCardPinned({ note }: NoteCardPinnedProps) {
  const { theme, setSelectedNoteId, categories } = useAppStore();
  const isDark = theme === 'dark';

  const category = categories.find((c) => c.id === note.category_id);
  const timeAgo = getTimeAgo(note.updated_at);

  return (
    <div
      onClick={() => setSelectedNoteId(note.id)}
      className="note-card cursor-pointer glass-card flex flex-col gap-3"
      style={{
        borderRadius: 20,
        padding: 16,
        backgroundColor: isDark ? '#1B263B' : '#FFFFFF',
        border: `1px solid ${isDark ? 'rgba(119,141,169,0.15)' : 'rgba(13,27,42,0.08)'}`,
        backdropFilter: 'blur(20px)',
      }}
    >
      {/* Tag + Copy row */}
      <div className="flex items-center justify-between gap-2">
        {category ? (
          <span
            className="text-[10px] font-body font-semibold px-2 py-1 rounded-md"
            style={{
              backgroundColor: `${category.color}2e`,
              color: category.color,
              fontFamily: 'var(--font-manrope)',
            }}
          >
            {category.icon} {category.name}
          </span>
        ) : (
          <span />
        )}
        <CopyButton text={`${note.title}\n\n${note.body}`} size="sm" />
      </div>

      {/* Title */}
      <h3
        className="text-sm font-bold leading-tight line-clamp-2"
        style={{ fontFamily: 'var(--font-bricolage)', color: isDark ? '#E0E1DD' : '#0D1B2A' }}
      >
        {note.title}
      </h3>

      {/* Preview */}
      <p
        className="text-[11px] leading-relaxed line-clamp-2"
        style={{ color: isDark ? '#778DA9' : '#415A77', fontFamily: 'var(--font-manrope)' }}
      >
        {note.body}
      </p>

      {/* Footer */}
      <div className="flex items-center gap-2 mt-auto">
        <span
          className="text-[10px]"
          style={{ fontFamily: 'var(--font-jetbrains)', color: isDark ? '#415A77' : '#778DA9' }}
        >
          {timeAgo}
        </span>
        <span className="text-[10px]" style={{ color: isDark ? '#415A77' : '#778DA9' }}>🔒</span>
        <span className="text-[10px]" style={{ color: isDark ? '#F4A261' : '#E09049' }}>●</span>
      </div>
    </div>
  );
}

function getTimeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return date.toLocaleDateString();
}
