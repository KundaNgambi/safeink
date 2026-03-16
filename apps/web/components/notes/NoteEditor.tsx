'use client';

import { useState, useEffect } from 'react';
import { useAppStore } from '@/store';
import type { NoteDecrypted } from '@safeink/shared';

interface NoteEditorProps {
  note?: NoteDecrypted;
  onSave: (title: string, body: string, categoryId: string | null) => void | Promise<void>;
  onClose: () => void;
}

export default function NoteEditor({ note, onSave, onClose }: NoteEditorProps) {
  const { theme, categories } = useAppStore();
  const isDark = theme === 'dark';

  const [title, setTitle] = useState(note?.title || '');
  const [body, setBody] = useState(note?.body || '');
  const [categoryId, setCategoryId] = useState<string | null>(note?.category_id || null);

  useEffect(() => {
    if (note) {
      setTitle(note.title);
      setBody(note.body);
      setCategoryId(note.category_id);
    }
  }, [note]);

  const handleSave = () => {
    if (!title.trim()) return;
    onSave(title.trim(), body, categoryId);
  };

  const accent = isDark ? '#F4A261' : '#E09049';
  const accentFg = isDark ? '#0D1B2A' : '#FFFFFF';

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col fade-in"
      style={{ backgroundColor: isDark ? '#0D1B2A' : '#F8F7F4' }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-5 py-4"
        style={{ borderBottom: `1px solid ${isDark ? 'rgba(119,141,169,0.15)' : 'rgba(13,27,42,0.08)'}` }}
      >
        <button
          onClick={onClose}
          className="text-sm font-body font-semibold px-3 py-1.5 rounded-lg"
          style={{ color: isDark ? '#778DA9' : '#415A77' }}
        >
          Cancel
        </button>
        <span
          className="text-sm font-display font-bold"
          style={{ color: isDark ? '#E0E1DD' : '#0D1B2A', fontFamily: 'var(--font-bricolage)' }}
        >
          {note ? 'Edit Note' : 'New Note'}
        </span>
        <button
          onClick={handleSave}
          className="text-sm font-body font-bold px-4 py-1.5 rounded-lg transition-all"
          style={{
            backgroundColor: title.trim() ? accent : `${accent}33`,
            color: title.trim() ? accentFg : `${accent}88`,
          }}
        >
          Save
        </button>
      </div>

      {/* Category selector */}
      <div
        className="flex items-center gap-2 px-5 py-3 overflow-x-auto"
        style={{ borderBottom: `1px solid ${isDark ? 'rgba(119,141,169,0.08)' : 'rgba(13,27,42,0.04)'}` }}
      >
        <button
          onClick={() => setCategoryId(null)}
          className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-body font-semibold transition-all"
          style={{
            backgroundColor: !categoryId ? `${accent}20` : 'transparent',
            color: !categoryId ? accent : (isDark ? '#778DA9' : '#415A77'),
            border: `1px solid ${!categoryId ? `${accent}40` : (isDark ? 'rgba(119,141,169,0.15)' : 'rgba(13,27,42,0.08)')}`,
          }}
        >
          No Category
        </button>
        {categories.filter((c) => !c.parent_id).map((cat) => (
          <button
            key={cat.id}
            onClick={() => setCategoryId(cat.id)}
            className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-body font-semibold transition-all"
            style={{
              backgroundColor: categoryId === cat.id ? `${cat.color}33` : 'transparent',
              color: categoryId === cat.id ? cat.color : (isDark ? '#778DA9' : '#415A77'),
              border: `1px solid ${categoryId === cat.id ? `${cat.color}66` : (isDark ? 'rgba(119,141,169,0.15)' : 'rgba(13,27,42,0.08)')}`,
            }}
          >
            {cat.icon} {cat.name}
          </button>
        ))}
      </div>

      {/* Editor */}
      <div className="flex-1 overflow-auto px-5 py-4">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Note title..."
          className="w-full text-xl font-display font-bold bg-transparent outline-none mb-4"
          style={{
            fontFamily: 'var(--font-bricolage)',
            color: isDark ? '#E0E1DD' : '#0D1B2A',
          }}
          autoFocus
        />
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Start writing..."
          className="w-full flex-1 bg-transparent outline-none resize-none text-sm leading-relaxed font-body"
          style={{
            fontFamily: 'var(--font-manrope)',
            color: isDark ? '#E0E1DD' : '#0D1B2A',
            minHeight: 400,
          }}
        />
      </div>

      {/* Formatting toolbar */}
      <div
        className="flex items-center gap-1 px-5 py-3"
        style={{
          borderTop: `1px solid ${isDark ? 'rgba(119,141,169,0.15)' : 'rgba(13,27,42,0.08)'}`,
          backgroundColor: isDark ? 'rgba(13,27,42,0.95)' : 'rgba(248,247,244,0.95)',
        }}
      >
        {['B', 'I', 'U', 'S', 'H1', 'H2', '≡', '☑', '<>', '🔗', '📎'].map((btn) => (
          <button
            key={btn}
            className="flex items-center justify-center w-8 h-8 rounded-lg text-xs font-bold transition-colors hover:bg-white/5"
            style={{ color: isDark ? '#778DA9' : '#415A77' }}
          >
            {btn}
          </button>
        ))}
      </div>
    </div>
  );
}
