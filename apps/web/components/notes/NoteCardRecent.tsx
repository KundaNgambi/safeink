'use client';

import { useAppStore } from '@/store';
import CopyButton from '@/components/common/CopyButton';
import { Lock } from 'lucide-react';
import type { NoteDecrypted } from '@safeink/shared';

interface NoteCardRecentProps {
  note: NoteDecrypted;
}

export default function NoteCardRecent({ note }: NoteCardRecentProps) {
  const { theme, setSelectedNoteId, categories } = useAppStore();
  const isDark = theme === 'dark';

  const category = categories.find((c) => c.id === note.category_id);
  const timeAgo = getTimeAgo(note.updated_at);

  const primaryText = isDark ? '#E0E1DD' : '#1B263B';
  const secondaryText = isDark ? 'rgba(224,225,221,0.6)' : 'rgba(27,38,59,0.6)';
  const tertiaryText = isDark ? 'rgba(224,225,221,0.35)' : 'rgba(27,38,59,0.35)';
  const cardBg = isDark ? '#243447' : '#FFFFFF';
  const cardBorder = isDark ? 'rgba(224,225,221,0.1)' : 'rgba(27,38,59,0.1)';

  return (
    <div
      onClick={() => setSelectedNoteId(note.id)}
      className="note-card cursor-pointer flex items-center gap-3"
      style={{
        borderRadius: 20,
        padding: '14px 16px',
        backgroundColor: cardBg,
        border: `1px solid ${cardBorder}`,
      }}
    >
      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <h3
            className="text-sm font-bold truncate"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: primaryText }}
          >
            {note.title}
          </h3>
        </div>
        <p
          className="text-[11px] truncate mt-0.5"
          style={{ color: secondaryText, fontFamily: "'Plus Jakarta Sans', sans-serif" }}
        >
          {note.body}
        </p>
        <div className="flex items-center gap-2 mt-1">
          <span
            className="text-[10px]"
            style={{ fontFamily: "'JetBrains Mono', monospace", color: tertiaryText }}
          >
            {timeAgo}
          </span>
          <Lock size={10} style={{ color: tertiaryText }} />
          {category && (
            <span
              className="text-[10px] font-medium"
              style={{ color: secondaryText, fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              {category.name}
            </span>
          )}
        </div>
      </div>

      {/* Copy button */}
      <CopyButton text={`${note.title}\n\n${note.body}`} size="sm" />
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
