'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAppStore } from '@/store';
import {
  Bold, Italic, Underline, Strikethrough,
  CheckSquare, Code, Link, List, ListOrdered, Paperclip,
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
  const [categoryId, setCategoryId] = useState<string | null>(note?.category_id || null);
  const [toolbarBottom, setToolbarBottom] = useState(16);
  const [activeFormats, setActiveFormats] = useState<Record<string, boolean>>({});
  const editorRef = useRef<HTMLDivElement>(null);
  const initializedRef = useRef(false);

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

  // Initialize editor content
  useEffect(() => {
    if (editorRef.current && !initializedRef.current) {
      const bodyContent = note?.body || '';
      // If body contains HTML tags, set as HTML; otherwise convert plain text
      if (bodyContent.includes('<') && bodyContent.includes('>')) {
        editorRef.current.innerHTML = bodyContent;
      } else {
        editorRef.current.innerHTML = bodyContent
          .split('\n')
          .map((line) => (line ? `<div>${line}</div>` : '<div><br></div>'))
          .join('');
      }
      initializedRef.current = true;
    }
  }, [note]);

  useEffect(() => {
    if (note) {
      setTitle(note.title);
      setCategoryId(note.category_id);
    }
  }, [note]);

  // Update active format state on selection change
  const updateActiveFormats = useCallback(() => {
    setActiveFormats({
      bold: document.queryCommandState('bold'),
      italic: document.queryCommandState('italic'),
      underline: document.queryCommandState('underline'),
      strike: document.queryCommandState('strikeThrough'),
      unorderedList: document.queryCommandState('insertUnorderedList'),
      orderedList: document.queryCommandState('insertOrderedList'),
    });
  }, []);

  useEffect(() => {
    document.addEventListener('selectionchange', updateActiveFormats);
    return () => document.removeEventListener('selectionchange', updateActiveFormats);
  }, [updateActiveFormats]);

  const getBodyContent = useCallback((): string => {
    return editorRef.current?.innerHTML || '';
  }, []);

  const handleSave = () => {
    if (!title.trim()) return;
    const validCategoryId = categoryId && categories.some((c) => c.id === categoryId)
      ? categoryId
      : null;
    onSave(title.trim(), getBodyContent(), validCategoryId);
  };

  const execCommand = useCallback((command: string, value?: string) => {
    editorRef.current?.focus();
    document.execCommand(command, false, value);
    updateActiveFormats();
  }, [updateActiveFormats]);

  const applyFormat = useCallback((key: string) => {
    switch (key) {
      case 'bold':
        execCommand('bold');
        break;
      case 'italic':
        execCommand('italic');
        break;
      case 'underline':
        execCommand('underline');
        break;
      case 'strike':
        execCommand('strikeThrough');
        break;
      case 'unorderedList':
        execCommand('insertUnorderedList');
        break;
      case 'orderedList':
        execCommand('insertOrderedList');
        break;
      case 'checklist':
        insertChecklist();
        break;
      case 'code':
        execCommand('formatBlock', 'pre');
        break;
      case 'link': {
        const url = prompt('Enter URL:');
        if (url) execCommand('createLink', url);
        break;
      }
    }
  }, [execCommand]);

  const insertChecklist = useCallback(() => {
    const editor = editorRef.current;
    if (!editor) return;
    editor.focus();

    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);

    // Check if we're already in a checklist - if so, remove it
    const existing = range.startContainer.parentElement?.closest('.checklist');
    if (existing) {
      const text = existing.textContent || '';
      const div = document.createElement('div');
      div.textContent = text;
      existing.replaceWith(div);
      return;
    }

    const item = document.createElement('div');
    item.className = 'checklist';
    item.innerHTML = '<label><input type="checkbox"><span></span></label>';

    const selectedText = selection.toString();
    if (selectedText) {
      const lines = selectedText.split('\n').filter(Boolean);
      range.deleteContents();
      lines.forEach((line, i) => {
        const el = i === 0 ? item : item.cloneNode(true) as HTMLDivElement;
        const span = el.querySelector('span')!;
        span.textContent = line;
        range.insertNode(el);
        range.setStartAfter(el);
      });
    } else {
      const span = item.querySelector('span')!;
      span.innerHTML = '&#8203;'; // zero-width space for cursor
      range.insertNode(item);
      // Place cursor inside the span
      const newRange = document.createRange();
      newRange.setStart(span, 0);
      newRange.collapse(true);
      selection.removeAllRanges();
      selection.addRange(newRange);
    }
  }, []);

  // Handle Enter key for checklist continuation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key !== 'Enter') return;

    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const node = selection.anchorNode;
    const checklistItem = node?.parentElement?.closest('.checklist');

    if (checklistItem) {
      e.preventDefault();
      const span = checklistItem.querySelector('span');
      // If current checklist item is empty, remove it and break out
      if (!span?.textContent?.trim()) {
        const div = document.createElement('div');
        div.innerHTML = '<br>';
        checklistItem.replaceWith(div);
        const range = document.createRange();
        range.setStart(div, 0);
        range.collapse(true);
        selection.removeAllRanges();
        selection.addRange(range);
        return;
      }

      // Create new checklist item
      const newItem = document.createElement('div');
      newItem.className = 'checklist';
      newItem.innerHTML = '<label><input type="checkbox"><span>&#8203;</span></label>';
      checklistItem.after(newItem);

      const newSpan = newItem.querySelector('span')!;
      const range = document.createRange();
      range.setStart(newSpan, 0);
      range.collapse(true);
      selection.removeAllRanges();
      selection.addRange(range);
    }
  }, []);

  // Handle checkbox clicks
  const handleEditorClick = useCallback((e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.tagName === 'INPUT' && target.getAttribute('type') === 'checkbox') {
      // Allow the checkbox to toggle
      e.stopPropagation();
      const checkbox = target as HTMLInputElement;
      const span = checkbox.parentElement?.querySelector('span');
      if (span) {
        if (checkbox.checked) {
          span.style.textDecoration = 'line-through';
          span.style.opacity = '0.5';
        } else {
          span.style.textDecoration = 'none';
          span.style.opacity = '1';
        }
      }
    }
  }, []);

  const bgColor = isDark ? '#1B263B' : '#E0E1DD';
  const primaryText = isDark ? '#E0E1DD' : '#1B263B';
  const secondaryText = isDark ? 'rgba(224,225,221,0.6)' : 'rgba(27,38,59,0.6)';
  const tertiaryText = isDark ? 'rgba(224,225,221,0.35)' : 'rgba(27,38,59,0.35)';
  const borderColor = isDark ? 'rgba(224,225,221,0.12)' : 'rgba(27,38,59,0.12)';
  const pillBg = isDark ? 'rgba(224,225,221,0.08)' : 'rgba(27,38,59,0.06)';
  const pillBorder = isDark ? 'rgba(224,225,221,0.12)' : 'rgba(27,38,59,0.1)';
  const activeCategory = isDark ? '#E0E1DD' : '#1B263B';
  const activeCategoryFg = isDark ? '#1B263B' : '#E0E1DD';
  const activeBtnBg = isDark ? 'rgba(224,225,221,0.2)' : 'rgba(27,38,59,0.15)';

  const toolbarItems = [
    { icon: Bold, key: 'bold' },
    { icon: Italic, key: 'italic' },
    { icon: Underline, key: 'underline' },
    { icon: Strikethrough, key: 'strike' },
    { key: 'divider' },
    { icon: List, key: 'unorderedList' },
    { icon: ListOrdered, key: 'orderedList' },
    { icon: CheckSquare, key: 'checklist' },
    { key: 'divider2' },
    { icon: Code, key: 'code' },
    { icon: Link, key: 'link' },
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
        {/* Rich text editor */}
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          onKeyDown={handleKeyDown}
          onClick={handleEditorClick}
          data-placeholder="Start writing..."
          className="editor-content w-full bg-transparent outline-none leading-relaxed"
          style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontSize: 14,
            color: primaryText,
            lineHeight: 1.8,
            minHeight: 300,
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
          }}
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
          if (item.key === 'divider' || item.key === 'divider2') {
            return (
              <div
                key={item.key}
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
          const isActive = activeFormats[item.key] || false;
          return (
            <button
              key={item.key}
              onClick={() => applyFormat(item.key)}
              className="flex items-center justify-center transition-all active:scale-90"
              style={{
                width: 34,
                height: 34,
                borderRadius: 17,
                background: isActive ? activeBtnBg : 'transparent',
                border: 'none',
                cursor: 'pointer',
                opacity: isActive ? 1 : 0.6,
              }}
            >
              <Icon size={18} strokeWidth={isActive ? 2 : 1.5} style={{ color: primaryText }} />
            </button>
          );
        })}
      </div>

      {/* Editor styles */}
      <style jsx global>{`
        .editor-content:empty::before {
          content: attr(data-placeholder);
          color: ${tertiaryText};
          pointer-events: none;
        }
        .editor-content .checklist {
          display: flex;
          align-items: flex-start;
          gap: 8px;
          padding: 2px 0;
        }
        .editor-content .checklist label {
          display: flex;
          align-items: flex-start;
          gap: 8px;
          cursor: pointer;
          width: 100%;
        }
        .editor-content .checklist input[type="checkbox"] {
          margin-top: 4px;
          width: 16px;
          height: 16px;
          accent-color: ${primaryText};
          cursor: pointer;
          flex-shrink: 0;
        }
        .editor-content .checklist span {
          flex: 1;
          outline: none;
        }
        .editor-content pre {
          background: ${isDark ? 'rgba(224,225,221,0.06)' : 'rgba(27,38,59,0.06)'};
          border-radius: 8px;
          padding: 12px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 13px;
          overflow-x: auto;
        }
        .editor-content a {
          color: ${isDark ? '#7DB8F2' : '#2563EB'};
          text-decoration: underline;
        }
        .editor-content ul, .editor-content ol {
          padding-left: 24px;
          margin: 4px 0;
        }
        .editor-content li {
          padding: 1px 0;
        }
      `}</style>
    </div>
  );
}
