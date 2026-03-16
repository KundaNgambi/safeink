'use client';

import { useAppStore } from '@/store';
import CopyButton from '@/components/common/CopyButton';
import { Pin, Lock, LockOpen, Trash2 } from 'lucide-react';
import type { NoteDecrypted } from '@safeink/shared';

interface NoteCardPinnedProps {
  note: NoteDecrypted;
  onDelete: (note: NoteDecrypted) => void;
  onUnlock: (note: NoteDecrypted, action: 'view' | 'toggle') => void;
}

export default function NoteCardPinned({ note, onDelete, onUnlock }: NoteCardPinnedProps) {
  const { theme, setSelectedNoteId, categories, updateNoteAsync } = useAppStore();
  const isDark = theme === 'dark';

  const category = categories.find((c) => c.id === note.category_id);
  const timeAgo = getTimeAgo(note.updated_at);

  const primaryText = isDark ? '#E0E1DD' : '#1B263B';
  const secondaryText = isDark ? 'rgba(224,225,221,0.6)' : 'rgba(27,38,59,0.6)';
  const tertiaryText = isDark ? 'rgba(224,225,221,0.35)' : 'rgba(27,38,59,0.35)';
  const cardBg = isDark ? '#243447' : '#FFFFFF';
  const cardBorder = isDark ? 'rgba(224,225,221,0.1)' : 'rgba(27,38,59,0.1)';

  const handleClick = () => {
    if (note.locked) {
      onUnlock(note, 'view');
    } else {
      setSelectedNoteId(note.id);
    }
  };

  const handleLockToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (note.locked) {
      onUnlock(note, 'toggle');
    } else {
      updateNoteAsync(note.id, { locked: true });
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(note);
  };

  return (
    <div
      onClick={handleClick}
      className="note-card cursor-pointer flex flex-col gap-3"
      style={{
        borderRadius: 20,
        padding: 16,
        backgroundColor: cardBg,
        border: `1px solid ${cardBorder}`,
        position: 'relative',
      }}
    >
      {/* Pin icon top-right */}
      <div style={{ position: 'absolute', top: 12, right: 12 }}>
        <Pin size={14} style={{ color: secondaryText }} />
      </div>

      {/* Category + Copy row */}
      <div className="flex items-center justify-between gap-2">
        {category ? (
          <span
            className="text-[10px] font-body font-medium"
            style={{
              color: secondaryText,
              fontFamily: "'Plus Jakarta Sans', sans-serif",
            }}
          >
            {category.name}
          </span>
        ) : (
          <span />
        )}
        {!note.locked && <CopyButton text={`${note.title}\n\n${note.body}`} size="sm" />}
      </div>

      {/* Title */}
      <h3
        className="text-sm font-bold leading-tight line-clamp-2"
        style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: primaryText }}
      >
        {note.title}
      </h3>

      {/* Preview */}
      <p
        className="text-[11px] leading-relaxed line-clamp-2"
        style={{ color: secondaryText, fontFamily: "'Plus Jakarta Sans', sans-serif" }}
      >
        {note.locked ? '••••••••••••••••' : note.body}
      </p>

      {/* Footer */}
      <div className="flex items-center gap-2 mt-auto">
        <span
          className="text-[10px]"
          style={{ fontFamily: "'JetBrains Mono', monospace", color: tertiaryText }}
        >
          {timeAgo}
        </span>
        <div className="flex-1" />
        <button
          onClick={handleLockToggle}
          className="flex items-center justify-center"
          title={note.locked ? 'Unlock note' : 'Lock note'}
          style={{
            width: 26,
            height: 26,
            borderRadius: 13,
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          {note.locked ? (
            <Lock size={12} strokeWidth={1.5} style={{ color: '#C45C6A' }} />
          ) : (
            <LockOpen size={12} strokeWidth={1.5} style={{ color: tertiaryText }} />
          )}
        </button>
        <button
          onClick={handleDelete}
          className="flex items-center justify-center"
          title="Delete note"
          style={{
            width: 26,
            height: 26,
            borderRadius: 13,
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          <Trash2 size={12} strokeWidth={1.5} style={{ color: tertiaryText }} />
        </button>
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
