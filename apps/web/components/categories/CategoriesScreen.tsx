'use client';

import { useState, useCallback } from 'react';
import { useAppStore } from '@/store';
import CategoryItem from './CategoryItem';
import CategoryModal from './CategoryModal';
import DeleteCategoryModal from './DeleteCategoryModal';
import { CATEGORY_ICONS, CATEGORY_COLORS } from '@safeink/shared';

export default function CategoriesScreen() {
  const {
    theme, categories, setCategories,
    showCreateCategory, setShowCreateCategory,
    editingCategory, setEditingCategory,
    deletingCategory, setDeletingCategory,
    addCategory, updateCategory, deleteCategory,
    setActiveTab, setActiveCategoryFilter,
  } = useAppStore();
  const isDark = theme === 'dark';
  const accent = isDark ? '#F4A261' : '#E09049';

  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const [dragId, setDragId] = useState<string | null>(null);

  const topCategories = categories
    .filter((c) => !c.parent_id)
    .sort((a, b) => a.sort_order - b.sort_order);

  const handleDragStart = useCallback((id: string) => setDragId(id), []);
  const handleDragOver = useCallback((id: string) => setDragOverId(id), []);
  const handleDragEnd = useCallback(() => {
    if (dragId && dragOverId && dragId !== dragOverId) {
      const dragCat = categories.find((c) => c.id === dragId);
      const overCat = categories.find((c) => c.id === dragOverId);
      if (dragCat && overCat && dragCat.parent_id === overCat.parent_id) {
        const siblings = categories
          .filter((c) => c.parent_id === dragCat.parent_id)
          .sort((a, b) => a.sort_order - b.sort_order);
        const fromIdx = siblings.findIndex((c) => c.id === dragId);
        const toIdx = siblings.findIndex((c) => c.id === dragOverId);
        if (fromIdx !== -1 && toIdx !== -1) {
          const reordered = [...siblings];
          const [moved] = reordered.splice(fromIdx, 1);
          reordered.splice(toIdx, 0, moved);
          const updated = categories.map((c) => {
            const idx = reordered.findIndex((r) => r.id === c.id);
            return idx !== -1 ? { ...c, sort_order: idx } : c;
          });
          setCategories(updated);
        }
      }
    }
    setDragId(null);
    setDragOverId(null);
  }, [dragId, dragOverId, categories, setCategories]);

  const handleCreateCategory = (data: { name: string; icon: string; color: string; parent_id?: string | null }) => {
    const newCat = {
      id: crypto.randomUUID(),
      user_id: 'demo',
      name: data.name,
      icon: data.icon,
      color: data.color,
      parent_id: data.parent_id || null,
      sort_order: categories.filter((c) => c.parent_id === (data.parent_id || null)).length,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    addCategory(newCat);
  };

  const handleEditCategory = (data: { name: string; icon: string; color: string }) => {
    if (!editingCategory) return;
    updateCategory(editingCategory.id, data);
    setEditingCategory(null);
  };

  const handleDeleteCategory = (categoryId: string, reassignTo: string | null) => {
    // Reassign notes
    const { notes, updateNote } = useAppStore.getState();
    const allDescendantIds = getDescendantIds(categoryId, categories);
    const affectedIds = [categoryId, ...allDescendantIds];

    notes.forEach((note) => {
      if (note.category_id && affectedIds.includes(note.category_id)) {
        updateNote(note.id, { category_id: reassignTo });
      }
    });

    // Delete category and descendants
    affectedIds.forEach((id) => deleteCategory(id));
  };

  const handleCategoryClick = (catId: string) => {
    setActiveCategoryFilter(catId);
    setActiveTab('notes');
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-5 pt-5 pb-4 flex items-center justify-between">
        <h1
          className="text-2xl font-[800]"
          style={{ fontFamily: 'var(--font-bricolage)', color: isDark ? '#E0E1DD' : '#0D1B2A' }}
        >
          Categories
        </h1>
        <button
          onClick={() => setShowCreateCategory(true)}
          className="px-4 py-2 rounded-xl text-sm font-body font-bold transition-all hover:scale-105"
          style={{
            backgroundColor: `${accent}14`,
            color: accent,
            border: `1px solid ${accent}33`,
            fontFamily: 'var(--font-manrope)',
          }}
        >
          + New
        </button>
      </div>

      {/* Category list */}
      <div className="flex-1 overflow-auto px-5 pb-24">
        {topCategories.length > 0 ? (
          topCategories.map((cat) => (
            <div key={cat.id} onClick={() => handleCategoryClick(cat.id)} className="cursor-pointer">
              <CategoryItem
                category={cat}
                depth={0}
                allCategories={categories}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDragEnd={handleDragEnd}
                dragOverId={dragOverId}
              />
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-20">
            <span className="text-4xl mb-4">📂</span>
            <h3
              className="text-lg font-display font-bold mb-2"
              style={{ fontFamily: 'var(--font-bricolage)', color: isDark ? '#E0E1DD' : '#0D1B2A' }}
            >
              No categories yet
            </h3>
            <p
              className="text-sm font-body text-center"
              style={{ color: isDark ? '#778DA9' : '#415A77', fontFamily: 'var(--font-manrope)' }}
            >
              Create categories to organize your notes
            </p>
          </div>
        )}
      </div>

      {/* Create Modal */}
      <CategoryModal
        isOpen={showCreateCategory}
        onClose={() => setShowCreateCategory(false)}
        onSave={handleCreateCategory}
      />

      {/* Edit Modal */}
      <CategoryModal
        isOpen={!!editingCategory}
        onClose={() => setEditingCategory(null)}
        category={editingCategory}
        onSave={handleEditCategory}
      />

      {/* Delete Modal */}
      <DeleteCategoryModal
        isOpen={!!deletingCategory}
        onClose={() => setDeletingCategory(null)}
        category={deletingCategory}
        onConfirm={handleDeleteCategory}
      />
    </div>
  );
}

function getDescendantIds(parentId: string, categories: { id: string; parent_id: string | null }[]): string[] {
  const children = categories.filter((c) => c.parent_id === parentId);
  return children.reduce<string[]>(
    (acc, child) => [...acc, child.id, ...getDescendantIds(child.id, categories)],
    []
  );
}
