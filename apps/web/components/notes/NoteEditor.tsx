'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAppStore } from '@/store';
import {
  Bold, Italic, Underline, Strikethrough,
  CheckSquare, Code, Link, Paperclip,
} from 'lucide-react';
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
  const [toolbarBottom, setToolbarBottom] = useState(16);

  // Track virtual keyboard via visualViewport API
  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;

    const onResize = () => {
      const offset = window.innerHeight - vv.height - vv.offsetTop;
      setToolbarBottom(offset > 0 ? offset + 12 : 16);
    };

    vv.addEventListener('resize', onResize);
    vv.addEventListener('scroll', onResize);
    return () => {
      vv.removeEventListener('resize', onResize);
      vv.removeEventListener('scroll', onResize);
    };
  }, []);

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
  const oppositeBg = isDark ? '#E0E1DD' : '#1B263B';
  const oppositeFg = isDark ? '#1B263B' : '#E0E1DD';
  const pillBg = isDark ? 'rgba(224,225,221,0.08)' : 'rgba(27,38,59,0.06)';
  const pillBorder = isDark ? 'rgba(224,225,221,0.12)' : 'rgba(27,38,59,0.1)';
  const activeCategory = isDark ? '#E0E1DD' : '#1B263B';
  const activeCategoryFg = isDark ? '#1B263B' : '#E0E1DD';

  const toolbarItems = [
    { icon: Bold, key: 'bold' },
    { icon: Italic, key: 'italic' },
    { icon: Underline, key: 'underline' },
    { icon: Strikethrough, key: 'strike' },
    { key: 'divider' },
    { icon: CheckSquare, key: 'checklist' },
    { icon: Code, key: 'code' },
    { icon: Link, key: 'link' },
    { icon: Paperclip, key: 'attach' },
  ];

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
          className="text-sm font-medium"
          style={{
            color: secondaryText,
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          Cancel
        </button>
        <span
          className="text-sm font-bold"
          style={{ color: primaryText, fontFamily: "'Plus Jakarta Sans', sans-serif" }}
        >
          {note ? 'Edit Note' : 'New Note'}
        </span>
        <button
          onClick={handleSave}
          className="text-sm font-bold px-4 py-1.5 rounded-lg transition-all"
          style={{
            backgroundColor: title.trim()
              ? (isDark ? 'rgba(224,225,221,0.15)' : 'rgba(27,38,59,0.1)')
              : (isDark ? 'rgba(224,225,221,0.06)' : 'rgba(27,38,59,0.04)'),
            color: title.trim() ? primaryText : tertiaryText,
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            border: 'none',
            cursor: 'pointer',
          }}
        >
          Save
        </button>
      </div>

      {/* Category selector */}
      <div
        className="flex items-center gap-2 px-5 py-3 overflow-x-auto"
        style={{
          borderBottom: `1px solid ${borderColor}`,
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        <button
          onClick={() => setCategoryId(null)}
          className="flex-shrink-0 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all"
          style={{
            backgroundColor: !categoryId ? activeCategory : 'transparent',
            color: !categoryId ? activeCategoryFg : secondaryText,
            border: !categoryId ? 'none' : `1.5px solid ${borderColor}`,
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            cursor: 'pointer',
          }}
        >
          No Category
        </button>
        {categories.filter((c) => !c.parent_id).map((cat) => (
          <button
            key={cat.id}
            onClick={() => setCategoryId(cat.id)}
            className="flex-shrink-0 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all"
            style={{
              backgroundColor: categoryId === cat.id ? activeCategory : 'transparent',
              color: categoryId === cat.id ? activeCategoryFg : secondaryText,
              border: categoryId === cat.id ? 'none' : `1.5px solid ${borderColor}`,
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              cursor: 'pointer',
            }}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Editor area */}
      <div className="flex-1 overflow-auto px-5 py-4" style={{ paddingBottom: 80 }}>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Note title..."
          className="w-full bg-transparent outline-none mb-3"
          style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontSize: 24,
            fontWeight: 700,
            color: title ? primaryText : tertiaryText,
          }}
          autoFocus
          autoComplete="off"
          autoCorrect="off"
          data-form-type="other"
          data-lpignore="true"
        />
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Start writing..."
          className="w-full bg-transparent outline-none resize-none leading-relaxed"
          style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontSize: 14,
            color: primaryText,
            lineHeight: 1.8,
            minHeight: 300,
          }}
          autoComplete="off"
          autoCorrect="off"
          data-form-type="other"
          data-lpignore="true"
        />
      </div>

      {/* Floating pill toolbar */}
      <div
        className="fixed z-[60] flex items-center"
        style={{
          bottom: toolbarBottom,
          left: '50%',
          transform: 'translateX(-50%)',
          transition: 'bottom 0.15s ease-out',
          height: 42,
          padding: '0 6px',
          borderRadius: 21,
          background: pillBg,
          border: `1px solid ${pillBorder}`,
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          gap: 2,
        }}
      >
        {toolbarItems.map((item) => {
          if (item.key === 'divider') {
            return (
              <div
                key="divider"
                style={{
                  width: 1,
                  height: 18,
                  background: pillBorder,
                  margin: '0 4px',
                }}
              />
            );
          }
          const Icon = item.icon!;
          return (
            <button
              key={item.key}
              className="flex items-center justify-center transition-all"
              style={{
                width: 34,
                height: 34,
                borderRadius: 17,
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                opacity: 0.6,
              }}
            >
              <Icon size={18} strokeWidth={1.5} style={{ color: primaryText }} />
            </button>
          );
        })}
      </div>
    </div>
  );
}
