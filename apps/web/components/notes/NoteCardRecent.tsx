'use client';

import { useState } from 'react';
import { useAppStore } from '@/store';
import CopyButton from '@/components/common/CopyButton';
import { Lock, LockOpen, Trash2, Pin } from 'lucide-react';
import type { NoteDecrypted } from '@safeink/shared';

interface NoteCardRecentProps {
  note: NoteDecrypted;
  onDelete: (note: NoteDecrypted) => void;
  onUnlock: (note: NoteDecrypted, action: 'view' | 'toggle') => void;
}

export default function NoteCardRecent({ note, onDelete, onUnlock }: NoteCardRecentProps) {
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
      // Unlocking requires password
      onUnlock(note, 'toggle');
    } else {
      // Locking is instant
      updateNoteAsync(note.id, { locked: true });
    }
  };

  const handlePin = (e: React.MouseEvent) => {
    e.stopPropagation();
    updateNoteAsync(note.id, { pinned: !note.pinned });
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(note);
  };

  return (
    <div
      onClick={handleClick}
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
          {note.locked ? '••••••••••••••••' : stripHtml(note.body)}
        </p>
        <div className="flex items-center gap-2 mt-1">
          <span
            className="text-[10px]"
            style={{ fontFamily: "'JetBrains Mono', monospace", color: tertiaryText }}
          >
            {timeAgo}
          </span>
          {note.locked && <Lock size={10} style={{ color: '#C45C6A' }} />}
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

      {/* Actions */}
      <div className="flex items-center gap-1 flex-shrink-0">
        <button
          onClick={handlePin}
          className="flex items-center justify-center transition-all"
          title={note.pinned ? 'Unpin note' : 'Pin note'}
          style={{
            width: 30,
            height: 30,
            borderRadius: 15,
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          <Pin size={14} strokeWidth={1.5} style={{ color: note.pinned ? primaryText : tertiaryText, transform: note.pinned ? 'rotate(45deg)' : 'none' }} />
        </button>
        <button
          onClick={handleLockToggle}
          className="flex items-center justify-center transition-all"
          title={note.locked ? 'Unlock note' : 'Lock note'}
          style={{
            width: 30,
            height: 30,
            borderRadius: 15,
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          {note.locked ? (
            <Lock size={14} strokeWidth={1.5} style={{ color: '#C45C6A' }} />
          ) : (
            <LockOpen size={14} strokeWidth={1.5} style={{ color: tertiaryText }} />
          )}
        </button>
        <button
          onClick={handleDelete}
          className="flex items-center justify-center transition-all"
          title="Delete note"
          style={{
            width: 30,
            height: 30,
            borderRadius: 15,
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          <Trash2 size={14} strokeWidth={1.5} style={{ color: tertiaryText }} />
        </button>
        {!note.locked && <CopyButton text={`${note.title}\n\n${stripHtml(note.body)}`} size="sm" />}
      </div>
    </div>
  );
}

function stripHtml(html: string): string {
  if (!html) return '';
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
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
