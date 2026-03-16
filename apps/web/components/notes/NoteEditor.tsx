'use client';

import { useState, useEffect } from 'react';
import { useAppStore } from '@/store';
import { List, CheckSquare, Code, Link, Paperclip } from 'lucide-react';
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

  const bgColor = isDark ? '#1B263B' : '#E0E1DD';
  const primaryText = isDark ? '#E0E1DD' : '#1B263B';
  const secondaryText = isDark ? 'rgba(224,225,221,0.6)' : 'rgba(27,38,59,0.6)';
  const tertiaryText = isDark ? 'rgba(224,225,221,0.35)' : 'rgba(27,38,59,0.35)';
  const borderColor = isDark ? 'rgba(224,225,221,0.12)' : 'rgba(27,38,59,0.12)';
  const cardBg = isDark ? '#243447' : '#FFFFFF';
  const oppositeBg = isDark ? '#E0E1DD' : '#1B263B';
  const oppositeFg = isDark ? '#1B263B' : '#E0E1DD';

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col fade-in"
      style={{ backgroundColor: bgColor }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-5 py-4"
        style={{ borderBottom: `1px solid ${borderColor}` }}
      >
        <button
          onClick={onClose}
          className="text-sm font-body font-semibold px-3 py-1.5 rounded-lg"
          style={{ color: secondaryText, backgroundColor: 'transparent' }}
        >
          Cancel
        </button>
        <span
          className="text-sm font-display font-bold"
          style={{ color: primaryText, fontFamily: "'Plus Jakarta Sans', sans-serif" }}
        >
          {note ? 'Edit Note' : 'New Note'}
        </span>
        <button
          onClick={handleSave}
          className="text-sm font-body font-bold px-4 py-1.5 rounded-lg transition-all"
          style={{
            backgroundColor: title.trim() ? oppositeBg : `${isDark ? 'rgba(224,225,221,0.15)' : 'rgba(27,38,59,0.15)'}`,
            color: title.trim() ? oppositeFg : tertiaryText,
          }}
        >
          Save
        </button>
      </div>

      {/* Category selector */}
      <div
        className="flex items-center gap-2 px-5 py-3 overflow-x-auto"
        style={{ borderBottom: `1px solid ${borderColor}` }}
      >
        <button
          onClick={() => setCategoryId(null)}
          className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-body font-semibold transition-all"
          style={{
            backgroundColor: !categoryId ? primaryText : 'transparent',
            color: !categoryId ? (isDark ? '#1B263B' : '#E0E1DD') : secondaryText,
            border: `1.5px solid ${!categoryId ? primaryText : borderColor}`,
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
              backgroundColor: categoryId === cat.id ? primaryText : 'transparent',
              color: categoryId === cat.id ? (isDark ? '#1B263B' : '#E0E1DD') : secondaryText,
              border: `1.5px solid ${categoryId === cat.id ? primaryText : borderColor}`,
            }}
          >
            {cat.name}
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
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            color: primaryText,
          }}
          autoFocus
        />
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Start writing..."
          className="w-full flex-1 bg-transparent outline-none resize-none text-sm leading-relaxed font-body"
          style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            color: primaryText,
            minHeight: 400,
          }}
        />
      </div>

      {/* Formatting toolbar */}
      <div
        className="flex items-center gap-1 px-5 py-3"
        style={{
          borderTop: `1px solid ${borderColor}`,
          backgroundColor: cardBg,
        }}
      >
        {[
          { label: 'B', key: 'bold' },
          { label: 'I', key: 'italic' },
          { label: 'U', key: 'underline' },
          { label: 'S', key: 'strike' },
          { label: 'H1', key: 'h1' },
          { label: 'H2', key: 'h2' },
        ].map((btn) => (
          <button
            key={btn.key}
            className="flex items-center justify-center w-8 h-8 rounded-lg text-xs font-bold transition-colors"
            style={{ color: secondaryText }}
          >
            {btn.label}
          </button>
        ))}
        <button className="flex items-center justify-center w-8 h-8 rounded-lg transition-colors" style={{ color: secondaryText }}>
          <List size={14} />
        </button>
        <button className="flex items-center justify-center w-8 h-8 rounded-lg transition-colors" style={{ color: secondaryText }}>
          <CheckSquare size={14} />
        </button>
        <button className="flex items-center justify-center w-8 h-8 rounded-lg transition-colors" style={{ color: secondaryText }}>
          <Code size={14} />
        </button>
        <button className="flex items-center justify-center w-8 h-8 rounded-lg transition-colors" style={{ color: secondaryText }}>
          <Link size={14} />
        </button>
        <button className="flex items-center justify-center w-8 h-8 rounded-lg transition-colors" style={{ color: secondaryText }}>
          <Paperclip size={14} />
        </button>
      </div>
    </div>
  );
}
