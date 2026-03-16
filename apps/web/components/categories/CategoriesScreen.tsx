'use client';

import { useState, useCallback } from 'react';
import { useAppStore } from '@/store';
import CategoryModal from './CategoryModal';
import DeleteCategoryModal from './DeleteCategoryModal';
import { Plus, GripHorizontal, Pencil, Trash2, FolderOpen } from 'lucide-react';

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

  const primaryText = isDark ? '#E0E1DD' : '#1B263B';
  const secondaryText = isDark ? 'rgba(224,225,221,0.6)' : 'rgba(27,38,59,0.6)';
  const tertiaryText = isDark ? 'rgba(224,225,221,0.35)' : 'rgba(27,38,59,0.35)';
  const borderColor = isDark ? 'rgba(224,225,221,0.12)' : 'rgba(27,38,59,0.12)';
  const cardBg = isDark ? '#243447' : '#FFFFFF';
  const cardBorder = isDark ? 'rgba(224,225,221,0.1)' : 'rgba(27,38,59,0.1)';
  const oppositeBg = isDark ? '#E0E1DD' : '#1B263B';
  const oppositeFg = isDark ? '#1B263B' : '#E0E1DD';

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
    const { notes, updateNote } = useAppStore.getState();
    const allDescendantIds = getDescendantIds(categoryId, categories);
    const affectedIds = [categoryId, ...allDescendantIds];

    notes.forEach((note) => {
      if (note.category_id && affectedIds.includes(note.category_id)) {
        updateNote(note.id, { category_id: reassignTo });
      }
    });

    affectedIds.forEach((id) => deleteCategory(id));
  };

  const handleCategoryClick = (catId: string) => {
    setActiveCategoryFilter(catId);
    setActiveTab('notes');
  };

  const children = (parentId: string) =>
    categories.filter((c) => c.parent_id === parentId).sort((a, b) => a.sort_order - b.sort_order);

  const renderCategory = (cat: typeof categories[number], depth: number) => {
    const isOver = dragOverId === cat.id;
    const kids = children(cat.id);

    return (
      <div key={cat.id}>
        <div
          draggable
          onDragStart={() => handleDragStart(cat.id)}
          onDragOver={(e) => {
            e.preventDefault();
            handleDragOver(cat.id);
          }}
          onDragEnd={handleDragEnd}
          onClick={() => handleCategoryClick(cat.id)}
          className="flex items-center gap-3 cursor-pointer transition-all duration-200"
          style={{
            padding: '14px 16px',
            marginLeft: depth * 24,
            borderRadius: 16,
            backgroundColor: isOver ? (isDark ? 'rgba(224,225,221,0.15)' : 'rgba(27,38,59,0.1)') : cardBg,
            border: `1px solid ${isOver ? borderColor : cardBorder}`,
            marginBottom: 8,
          }}
        >
          {/* Drag handle */}
          <GripHorizontal size={16} style={{ color: tertiaryText, cursor: 'grab', flexShrink: 0 }} />

          {/* Name */}
          <div className="flex-1 min-w-0">
            <h3
              className="text-sm font-bold truncate"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: primaryText }}
            >
              {cat.name}
            </h3>
            <p
              className="text-[11px]"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: secondaryText }}
            >
              {kids.length > 0 ? `${kids.length} sub` : 'Empty'}
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setEditingCategory(cat);
              }}
              className="flex items-center justify-center transition-colors hover:opacity-80"
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                backgroundColor: 'transparent',
              }}
            >
              <Pencil size={14} style={{ color: secondaryText }} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setDeletingCategory(cat);
              }}
              className="flex items-center justify-center transition-colors hover:opacity-80"
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                backgroundColor: 'transparent',
              }}
            >
              <Trash2 size={14} style={{ color: secondaryText }} />
            </button>
          </div>
        </div>

        {/* Children */}
        {kids.map((child) => renderCategory(child, depth + 1))}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-5 pt-5 pb-4 flex items-center justify-between">
        <h1
          className="text-2xl font-[800]"
          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: primaryText }}
        >
          Categories
        </h1>
        <button
          onClick={() => setShowCreateCategory(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-body font-bold transition-all hover:scale-105"
          style={{
            backgroundColor: oppositeBg,
            color: oppositeFg,
            fontFamily: "'Plus Jakarta Sans', sans-serif",
          }}
        >
          <Plus size={14} />
          New
        </button>
      </div>

      {/* Category list */}
      <div className="flex-1 overflow-auto px-5 pb-24">
        {topCategories.length > 0 ? (
          topCategories.map((cat) => renderCategory(cat, 0))
        ) : (
          <div className="flex flex-col items-center justify-center py-20">
            <FolderOpen size={40} style={{ color: secondaryText, marginBottom: 16 }} />
            <h3
              className="text-lg font-display font-bold mb-2"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: primaryText }}
            >
              No categories yet
            </h3>
            <p
              className="text-sm font-body text-center"
              style={{ color: secondaryText, fontFamily: "'Plus Jakarta Sans', sans-serif" }}
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
