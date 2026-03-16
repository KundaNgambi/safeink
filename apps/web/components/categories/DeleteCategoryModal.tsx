'use client';

import { useState } from 'react';
import { useAppStore } from '@/store';
import Modal from '@/components/common/Modal';
import type { Category } from '@safeink/shared';

interface DeleteCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: Category | null;
  onConfirm: (categoryId: string, reassignTo: string | null) => void;
}

export default function DeleteCategoryModal({ isOpen, onClose, category, onConfirm }: DeleteCategoryModalProps) {
  const { theme, categories, notes } = useAppStore();
  const isDark = theme === 'dark';

  const [reassignTo, setReassignTo] = useState<string | null>(null);

  if (!category) return null;

  const subcategories = categories.filter((c) => c.parent_id === category.id);
  const allDescendantIds = getDescendantIds(category.id, categories);
  const affectedNotes = notes.filter((n) => n.category_id && [category.id, ...allDescendantIds].includes(n.category_id));
  const availableCategories = categories.filter(
    (c) => c.id !== category.id && !allDescendantIds.includes(c.id)
  );

  const handleConfirm = () => {
    onConfirm(category.id, reassignTo);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Delete Category">
      <div className="space-y-4">
        {/* Warning */}
        <div
          className="flex items-start gap-3 p-4 rounded-2xl"
          style={{
            backgroundColor: `${isDark ? '#FF6B6B' : '#EF5350'}14`,
            border: `1px solid ${isDark ? '#FF6B6B' : '#EF5350'}33`,
          }}
        >
          <span className="text-lg">⚠️</span>
          <div>
            <p className="text-sm font-body font-semibold mb-1" style={{ color: isDark ? '#FF6B6B' : '#EF5350', fontFamily: 'var(--font-manrope)' }}>
              Are you sure?
            </p>
            <p className="text-xs font-body" style={{ color: isDark ? '#8b8fa3' : '#6b7080', fontFamily: 'var(--font-manrope)' }}>
              This will delete <strong>{category.icon} {category.name}</strong>
              {subcategories.length > 0 && ` and ${subcategories.length} subcategories`}.
              {affectedNotes.length > 0 && ` ${affectedNotes.length} notes will be reassigned.`}
            </p>
          </div>
        </div>

        {/* Reassignment */}
        {affectedNotes.length > 0 && (
          <div>
            <label
              className="block text-xs font-body font-semibold mb-2 uppercase tracking-wider"
              style={{ color: isDark ? '#8b8fa3' : '#6b7080', fontFamily: 'var(--font-manrope)' }}
            >
              Move {affectedNotes.length} notes to:
            </label>
            <div className="max-h-48 overflow-auto space-y-1">
              {/* Uncategorized option */}
              <button
                onClick={() => setReassignTo(null)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all"
                style={{
                  backgroundColor: reassignTo === null
                    ? `${isDark ? '#BEFF46' : '#4CAF50'}14`
                    : 'transparent',
                  border: `1px solid ${reassignTo === null
                    ? `${isDark ? '#BEFF46' : '#4CAF50'}40`
                    : (isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)')}`,
                }}
              >
                <span className="text-sm">📝</span>
                <span className="text-sm font-body" style={{ color: isDark ? '#f0f1f4' : '#1a1c24', fontFamily: 'var(--font-manrope)' }}>
                  Uncategorized
                </span>
                {reassignTo === null && (
                  <span className="ml-auto text-xs" style={{ color: isDark ? '#BEFF46' : '#4CAF50' }}>✓</span>
                )}
              </button>

              {availableCategories.map((cat) => {
                const catDepth = getCategoryDepth(cat, categories);
                return (
                  <button
                    key={cat.id}
                    onClick={() => setReassignTo(cat.id)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all"
                    style={{
                      paddingLeft: 12 + catDepth * 16,
                      backgroundColor: reassignTo === cat.id
                        ? `${isDark ? '#BEFF46' : '#4CAF50'}14`
                        : 'transparent',
                      border: `1px solid ${reassignTo === cat.id
                        ? `${isDark ? '#BEFF46' : '#4CAF50'}40`
                        : 'transparent'}`,
                    }}
                  >
                    <span
                      className="flex items-center justify-center text-sm flex-shrink-0"
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: 8,
                        backgroundColor: `${cat.color}2e`,
                      }}
                    >
                      {cat.icon}
                    </span>
                    <span className="text-sm font-body" style={{ color: isDark ? '#f0f1f4' : '#1a1c24', fontFamily: 'var(--font-manrope)' }}>
                      {cat.name}
                    </span>
                    {reassignTo === cat.id && (
                      <span className="ml-auto text-xs" style={{ color: isDark ? '#BEFF46' : '#4CAF50' }}>✓</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Buttons */}
        <div className="flex gap-3 pt-2">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-2xl text-sm font-body font-semibold"
            style={{
              backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
              color: isDark ? '#f0f1f4' : '#1a1c24',
              fontFamily: 'var(--font-manrope)',
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="flex-1 py-3 rounded-2xl text-sm font-body font-bold"
            style={{
              backgroundColor: isDark ? '#FF6B6B' : '#EF5350',
              color: '#ffffff',
              fontFamily: 'var(--font-manrope)',
            }}
          >
            Delete
          </button>
        </div>
      </div>
    </Modal>
  );
}

function getDescendantIds(parentId: string, categories: Category[]): string[] {
  const children = categories.filter((c) => c.parent_id === parentId);
  return children.reduce<string[]>(
    (acc, child) => [...acc, child.id, ...getDescendantIds(child.id, categories)],
    []
  );
}

function getCategoryDepth(category: Category, categories: Category[]): number {
  let depth = 0;
  let current = category;
  while (current.parent_id) {
    depth++;
    const parent = categories.find((c) => c.id === current.parent_id);
    if (!parent) break;
    current = parent;
  }
  return depth;
}
