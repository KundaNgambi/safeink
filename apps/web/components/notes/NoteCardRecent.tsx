'use client';

import { useAppStore } from '@/store';
import CopyButton from '@/components/common/CopyButton';
import type { NoteDecrypted } from '@safeink/shared';

interface NoteCardRecentProps {
  note: NoteDecrypted;
}

export default function NoteCardRecent({ note }: NoteCardRecentProps) {
  const { theme, setSelectedNoteId, categories } = useAppStore();
  const isDark = theme === 'dark';

  const category = categories.find((c) => c.id === note.category_id);
  const timeAgo = getTimeAgo(note.updated_at);

  return (
    <div
      onClick={() => setSelectedNoteId(note.id)}
      className="note-card cursor-pointer glass-card flex items-center gap-3"
      style={{
        borderRadius: 20,
        padding: '14px 16px',
        backgroundColor: isDark ? '#1B263B' : '#FFFFFF',
        border: `1px solid ${isDark ? 'rgba(119,141,169,0.15)' : 'rgba(13,27,42,0.08)'}`,
        backdropFilter: 'blur(20px)',
      }}
    >
      {/* Category icon */}
      <div
        className="flex-shrink-0 flex items-center justify-center text-lg"
        style={{
          width: 42,
          height: 42,
          borderRadius: 14,
          backgroundColor: category ? `${category.color}2e` : (isDark ? 'rgba(119,141,169,0.15)' : 'rgba(13,27,42,0.08)'),
        }}
      >
        {category?.icon || '📝'}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <h3
            className="text-sm font-bold truncate"
            style={{ fontFamily: 'var(--font-bricolage)', color: isDark ? '#E0E1DD' : '#0D1B2A' }}
          >
            {note.title}
          </h3>
          <CopyButton text={`${note.title}\n\n${note.body}`} size="sm" />
        </div>
        <p
          className="text-[11px] truncate mt-0.5"
          style={{ color: isDark ? '#778DA9' : '#415A77', fontFamily: 'var(--font-manrope)' }}
        >
          {note.body}
        </p>
        <div className="flex items-center gap-2 mt-1">
          <span
            className="text-[10px]"
            style={{ fontFamily: 'var(--font-jetbrains)', color: isDark ? '#415A77' : '#778DA9' }}
          >
            {timeAgo}
          </span>
          <span className="text-[10px]" style={{ color: isDark ? '#415A77' : '#778DA9' }}>🔒</span>
          {category && (
            <span
              className="text-[10px] font-medium"
              style={{ color: category.color, fontFamily: 'var(--font-manrope)' }}
            >
              {category.name}
            </span>
          )}
        </div>
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
