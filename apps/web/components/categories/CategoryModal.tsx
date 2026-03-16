'use client';

import { useState, useEffect } from 'react';
import { useAppStore } from '@/store';
import Modal from '@/components/common/Modal';
import { CATEGORY_ICONS, CATEGORY_COLORS, MAX_CATEGORY_NAME_LENGTH } from '@safeink/shared';
import type { Category } from '@safeink/shared';

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  category?: Category | null;
  parentCategory?: Category | null;
  onSave: (data: { name: string; icon: string; color: string; parent_id?: string | null }) => void;
}

export default function CategoryModal({ isOpen, onClose, category, parentCategory, onSave }: CategoryModalProps) {
  const { theme } = useAppStore();
  const isDark = theme === 'dark';
  const accent = isDark ? '#BEFF46' : '#4CAF50';
  const accentFg = isDark ? '#0f1117' : '#ffffff';

  const [name, setName] = useState('');
  const [icon, setIcon] = useState<string>(CATEGORY_ICONS[0]);
  const [color, setColor] = useState<string>(CATEGORY_COLORS[0]);

  useEffect(() => {
    if (category) {
      setName(category.name);
      setIcon(category.icon);
      setColor(category.color);
    } else {
      setName('');
      setIcon(CATEGORY_ICONS[0]);
      setColor(CATEGORY_COLORS[0]);
    }
  }, [category, isOpen]);

  const handleSave = () => {
    if (!name.trim()) return;
    onSave({
      name: name.trim(),
      icon,
      color,
      parent_id: parentCategory?.id || category?.parent_id || null,
    });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={category ? 'Edit Category' : 'New Category'}>
      {/* Parent context */}
      {parentCategory && (
        <div
          className="mb-4 px-3 py-2 rounded-lg text-xs font-body"
          style={{
            backgroundColor: `${parentCategory.color}14`,
            color: isDark ? '#8b8fa3' : '#6b7080',
            fontFamily: 'var(--font-manrope)',
          }}
        >
          Inside: <strong style={{ color: parentCategory.color }}>{parentCategory.icon} {parentCategory.name}</strong>
        </div>
      )}

      {/* Name input */}
      <div className="mb-5">
        <label
          className="block text-xs font-body font-semibold mb-2 uppercase tracking-wider"
          style={{ color: isDark ? '#8b8fa3' : '#6b7080', fontFamily: 'var(--font-manrope)' }}
        >
          Name
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value.slice(0, MAX_CATEGORY_NAME_LENGTH))}
          placeholder="Category name..."
          className="w-full px-4 py-3 rounded-xl text-sm font-body bg-transparent outline-none"
          style={{
            border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
            color: isDark ? '#f0f1f4' : '#1a1c24',
            fontFamily: 'var(--font-manrope)',
          }}
          autoFocus
        />
        <span className="text-[10px] mt-1 block" style={{ color: isDark ? '#555a6e' : '#9ca3af', fontFamily: 'var(--font-jetbrains)' }}>
          {name.length}/{MAX_CATEGORY_NAME_LENGTH}
        </span>
      </div>

      {/* Icon picker */}
      <div className="mb-5">
        <label
          className="block text-xs font-body font-semibold mb-2 uppercase tracking-wider"
          style={{ color: isDark ? '#8b8fa3' : '#6b7080', fontFamily: 'var(--font-manrope)' }}
        >
          Icon
        </label>
        <div className="grid grid-cols-10 gap-2">
          {CATEGORY_ICONS.map((emoji) => (
            <button
              key={emoji}
              onClick={() => setIcon(emoji)}
              className="flex items-center justify-center text-lg rounded-xl transition-all"
              style={{
                width: 40,
                height: 40,
                backgroundColor: icon === emoji ? `${accent}20` : 'transparent',
                border: `2px solid ${icon === emoji ? accent : 'transparent'}`,
              }}
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>

      {/* Color picker */}
      <div className="mb-6">
        <label
          className="block text-xs font-body font-semibold mb-2 uppercase tracking-wider"
          style={{ color: isDark ? '#8b8fa3' : '#6b7080', fontFamily: 'var(--font-manrope)' }}
        >
          Color
        </label>
        <div className="flex gap-2 flex-wrap">
          {CATEGORY_COLORS.map((c) => (
            <button
              key={c}
              onClick={() => setColor(c)}
              className="rounded-full transition-all"
              style={{
                width: 36,
                height: 36,
                backgroundColor: c,
                border: `3px solid ${color === c ? (isDark ? '#f0f1f4' : '#1a1c24') : 'transparent'}`,
                boxShadow: color === c ? `0 0 12px ${c}66` : 'none',
              }}
            />
          ))}
        </div>
      </div>

      {/* Preview */}
      <div className="mb-6">
        <label
          className="block text-xs font-body font-semibold mb-2 uppercase tracking-wider"
          style={{ color: isDark ? '#8b8fa3' : '#6b7080', fontFamily: 'var(--font-manrope)' }}
        >
          Preview
        </label>
        <div
          className="flex items-center gap-3 px-4 py-3 rounded-2xl"
          style={{
            backgroundColor: isDark ? 'rgba(26,30,42,0.85)' : 'rgba(255,255,255,0.9)',
            border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
          }}
        >
          <div
            className="flex items-center justify-center text-lg"
            style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: `${color}2e` }}
          >
            {icon}
          </div>
          <span
            className="text-sm font-bold"
            style={{ fontFamily: 'var(--font-bricolage)', color: isDark ? '#f0f1f4' : '#1a1c24' }}
          >
            {name || 'Category name'}
          </span>
        </div>
      </div>

      {/* Save button */}
      <button
        onClick={handleSave}
        disabled={!name.trim()}
        className="w-full py-3 rounded-2xl font-body font-bold text-sm transition-all"
        style={{
          backgroundColor: name.trim() ? accent : `${accent}33`,
          color: name.trim() ? accentFg : `${accent}66`,
          fontFamily: 'var(--font-manrope)',
        }}
      >
        {category ? 'Save Changes' : 'Create Category'}
      </button>
    </Modal>
  );
}
