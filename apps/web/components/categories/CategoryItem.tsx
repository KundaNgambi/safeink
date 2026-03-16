'use client';

import { useState } from 'react';
import { useAppStore } from '@/store';
import type { Category } from '@safeink/shared';

interface CategoryItemProps {
  category: Category;
  depth: number;
  allCategories: Category[];
  onDragStart: (id: string) => void;
  onDragOver: (id: string) => void;
  onDragEnd: () => void;
  dragOverId: string | null;
}

export default function CategoryItem({
  category,
  depth,
  allCategories,
  onDragStart,
  onDragOver,
  onDragEnd,
  dragOverId,
}: CategoryItemProps) {
  const { theme, setEditingCategory, setDeletingCategory, setShowCreateCategory } = useAppStore();
  const isDark = theme === 'dark';
  const accent = isDark ? '#BEFF46' : '#4CAF50';

  const children = allCategories.filter((c) => c.parent_id === category.id);
  const noteCount = 0; // Will be populated from actual data
  const isOver = dragOverId === category.id;

  return (
    <div>
      <div
        draggable
        onDragStart={() => onDragStart(category.id)}
        onDragOver={(e) => {
          e.preventDefault();
          onDragOver(category.id);
        }}
        onDragEnd={onDragEnd}
        className="flex items-center gap-3 transition-all duration-200"
        style={{
          padding: '14px 16px',
          marginLeft: depth * 24,
          borderRadius: 16,
          backgroundColor: isOver
            ? `${accent}14`
            : (isDark ? 'rgba(26,30,42,0.85)' : 'rgba(255,255,255,0.9)'),
          border: `1px solid ${isOver ? `${accent}40` : (isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)')}`,
          backdropFilter: 'blur(20px)',
          marginBottom: 8,
        }}
      >
        {/* Drag handle */}
        <div className="cursor-grab flex flex-col gap-[3px] opacity-40" style={{ color: isDark ? '#8b8fa3' : '#6b7080' }}>
          <div className="w-4 h-[2px] rounded-full" style={{ backgroundColor: 'currentColor' }} />
          <div className="w-4 h-[2px] rounded-full" style={{ backgroundColor: 'currentColor' }} />
          <div className="w-4 h-[2px] rounded-full" style={{ backgroundColor: 'currentColor' }} />
        </div>

        {/* Icon */}
        <div
          className="flex items-center justify-center text-lg flex-shrink-0"
          style={{
            width: 40,
            height: 40,
            borderRadius: 12,
            backgroundColor: `${category.color}2e`,
          }}
        >
          {category.icon}
        </div>

        {/* Name + meta */}
        <div className="flex-1 min-w-0">
          <h3
            className="text-sm font-bold truncate"
            style={{ fontFamily: 'var(--font-bricolage)', color: isDark ? '#f0f1f4' : '#1a1c24' }}
          >
            {category.name}
          </h3>
          <p
            className="text-[11px]"
            style={{ fontFamily: 'var(--font-manrope)', color: isDark ? '#555a6e' : '#9ca3af' }}
          >
            {children.length > 0 && `${children.length} sub`}
            {children.length > 0 && noteCount > 0 && ' · '}
            {noteCount > 0 && `${noteCount} notes`}
            {children.length === 0 && noteCount === 0 && 'Empty'}
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1.5">
          {/* Add subcategory (hidden at depth >= 2) */}
          {depth < 2 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                // Will set parent context for new category
                setShowCreateCategory(true);
              }}
              className="flex items-center justify-center transition-colors hover:scale-105"
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                backgroundColor: `${accent}14`,
                color: accent,
                fontSize: 16,
              }}
            >
              +
            </button>
          )}
          {/* Edit */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setEditingCategory(category);
            }}
            className="flex items-center justify-center transition-colors hover:scale-105"
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              backgroundColor: `${isDark ? '#5B9BFF' : '#2979FF'}14`,
              color: isDark ? '#5B9BFF' : '#2979FF',
              fontSize: 13,
            }}
          >
            ✎
          </button>
          {/* Delete */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setDeletingCategory(category);
            }}
            className="flex items-center justify-center transition-colors hover:scale-105"
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              backgroundColor: `${isDark ? '#FF6B6B' : '#EF5350'}14`,
              color: isDark ? '#FF6B6B' : '#EF5350',
              fontSize: 13,
            }}
          >
            ✕
          </button>
        </div>
      </div>

      {/* Children */}
      {children
        .sort((a, b) => a.sort_order - b.sort_order)
        .map((child) => (
          <CategoryItem
            key={child.id}
            category={child}
            depth={depth + 1}
            allCategories={allCategories}
            onDragStart={onDragStart}
            onDragOver={onDragOver}
            onDragEnd={onDragEnd}
            dragOverId={dragOverId}
          />
        ))}
    </div>
  );
}
