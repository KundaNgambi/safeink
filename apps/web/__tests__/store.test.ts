import { describe, it, expect, beforeEach } from 'vitest';
import { useAppStore } from '../store';
import type { NoteDecrypted, Category } from '@safeink/shared';

// Reset store between tests
function resetStore() {
  useAppStore.setState({
    theme: 'dark',
    activeTab: 'notes',
    loading: false,
    error: null,
    notes: [],
    selectedNoteId: null,
    categories: [],
    activeCategoryFilter: null,
    showCreateNote: false,
    showCreateCategory: false,
    editingCategory: null,
    deletingCategory: null,
    searchQuery: '',
  });
}

const mockNote: NoteDecrypted = {
  id: 'note-1',
  user_id: 'user-1',
  title: 'Test Note',
  body: 'Test body',
  category_id: null,
  pinned: false,
  archived: false,
  locked: false,
  deleted_at: null,
  created_at: '2026-03-16T10:00:00Z',
  updated_at: '2026-03-16T10:00:00Z',
};

const mockCategory: Category = {
  id: 'cat-1',
  user_id: 'user-1',
  name: 'Work',
  icon: '💼',
  color: '#5B9BFF',
  parent_id: null,
  sort_order: 0,
  created_at: '2026-03-16T10:00:00Z',
  updated_at: '2026-03-16T10:00:00Z',
};

// ─── Theme ───────────────────────────────────────────────────────────
describe('AppStore — Theme', () => {
  beforeEach(resetStore);

  it('should default to dark theme', () => {
    expect(useAppStore.getState().theme).toBe('dark');
  });

  it('should toggle theme from dark to light', () => {
    useAppStore.getState().toggleTheme();
    expect(useAppStore.getState().theme).toBe('light');
  });

  it('should toggle theme from light back to dark', () => {
    useAppStore.getState().toggleTheme();
    useAppStore.getState().toggleTheme();
    expect(useAppStore.getState().theme).toBe('dark');
  });

  it('should set theme directly', () => {
    useAppStore.getState().setTheme('light');
    expect(useAppStore.getState().theme).toBe('light');
  });
});

// ─── Navigation ──────────────────────────────────────────────────────
describe('AppStore — Navigation', () => {
  beforeEach(resetStore);

  it('should default to notes tab', () => {
    expect(useAppStore.getState().activeTab).toBe('notes');
  });

  it('should switch tabs', () => {
    useAppStore.getState().setActiveTab('categories');
    expect(useAppStore.getState().activeTab).toBe('categories');
  });

  it('should clear selectedNoteId when switching tabs', () => {
    useAppStore.setState({ selectedNoteId: 'note-1' });
    useAppStore.getState().setActiveTab('settings');
    expect(useAppStore.getState().selectedNoteId).toBeNull();
  });
});

// ─── Notes (local state) ────────────────────────────────────────────
describe('AppStore — Notes', () => {
  beforeEach(resetStore);

  it('should start with empty notes', () => {
    expect(useAppStore.getState().notes).toEqual([]);
  });

  it('should set notes', () => {
    useAppStore.getState().setNotes([mockNote]);
    expect(useAppStore.getState().notes).toHaveLength(1);
    expect(useAppStore.getState().notes[0].id).toBe('note-1');
  });

  it('should add a note to the beginning', () => {
    useAppStore.getState().setNotes([mockNote]);
    const newNote = { ...mockNote, id: 'note-2', title: 'New Note' };
    useAppStore.getState().addNote(newNote);
    expect(useAppStore.getState().notes).toHaveLength(2);
    expect(useAppStore.getState().notes[0].id).toBe('note-2');
  });

  it('should update a note by id', () => {
    useAppStore.getState().setNotes([mockNote]);
    useAppStore.getState().updateNote('note-1', { title: 'Updated Title' });
    expect(useAppStore.getState().notes[0].title).toBe('Updated Title');
  });

  it('should not affect other notes when updating', () => {
    const note2 = { ...mockNote, id: 'note-2', title: 'Note 2' };
    useAppStore.getState().setNotes([mockNote, note2]);
    useAppStore.getState().updateNote('note-1', { title: 'Changed' });
    expect(useAppStore.getState().notes[1].title).toBe('Note 2');
  });

  it('should delete a note by id', () => {
    useAppStore.getState().setNotes([mockNote]);
    useAppStore.getState().deleteNote('note-1');
    expect(useAppStore.getState().notes).toHaveLength(0);
  });

  it('should clear selectedNoteId when deleting the selected note', () => {
    useAppStore.setState({ notes: [mockNote], selectedNoteId: 'note-1' });
    useAppStore.getState().deleteNote('note-1');
    expect(useAppStore.getState().selectedNoteId).toBeNull();
  });

  it('should keep selectedNoteId when deleting a different note', () => {
    const note2 = { ...mockNote, id: 'note-2' };
    useAppStore.setState({ notes: [mockNote, note2], selectedNoteId: 'note-1' });
    useAppStore.getState().deleteNote('note-2');
    expect(useAppStore.getState().selectedNoteId).toBe('note-1');
  });

  it('should select a note', () => {
    useAppStore.getState().setSelectedNoteId('note-1');
    expect(useAppStore.getState().selectedNoteId).toBe('note-1');
  });

  it('should deselect a note', () => {
    useAppStore.setState({ selectedNoteId: 'note-1' });
    useAppStore.getState().setSelectedNoteId(null);
    expect(useAppStore.getState().selectedNoteId).toBeNull();
  });
});

// ─── Categories (local state) ───────────────────────────────────────
describe('AppStore — Categories', () => {
  beforeEach(resetStore);

  it('should start with empty categories', () => {
    expect(useAppStore.getState().categories).toEqual([]);
  });

  it('should set categories', () => {
    useAppStore.getState().setCategories([mockCategory]);
    expect(useAppStore.getState().categories).toHaveLength(1);
  });

  it('should add a category', () => {
    useAppStore.getState().addCategory(mockCategory);
    expect(useAppStore.getState().categories).toHaveLength(1);
  });

  it('should update a category', () => {
    useAppStore.getState().setCategories([mockCategory]);
    useAppStore.getState().updateCategory('cat-1', { name: 'Personal' });
    expect(useAppStore.getState().categories[0].name).toBe('Personal');
  });

  it('should delete a category and its children', () => {
    const child: Category = { ...mockCategory, id: 'cat-2', name: 'Child', parent_id: 'cat-1' };
    useAppStore.getState().setCategories([mockCategory, child]);
    useAppStore.getState().deleteCategory('cat-1');
    expect(useAppStore.getState().categories).toHaveLength(0);
  });

  it('should clear activeCategoryFilter when deleting filtered category', () => {
    useAppStore.setState({ categories: [mockCategory], activeCategoryFilter: 'cat-1' });
    useAppStore.getState().deleteCategory('cat-1');
    expect(useAppStore.getState().activeCategoryFilter).toBeNull();
  });

  it('should set active category filter', () => {
    useAppStore.getState().setActiveCategoryFilter('cat-1');
    expect(useAppStore.getState().activeCategoryFilter).toBe('cat-1');
  });

  it('should clear active category filter', () => {
    useAppStore.setState({ activeCategoryFilter: 'cat-1' });
    useAppStore.getState().setActiveCategoryFilter(null);
    expect(useAppStore.getState().activeCategoryFilter).toBeNull();
  });
});

// ─── Modals ──────────────────────────────────────────────────────────
describe('AppStore — Modals', () => {
  beforeEach(resetStore);

  it('should toggle create note modal', () => {
    expect(useAppStore.getState().showCreateNote).toBe(false);
    useAppStore.getState().setShowCreateNote(true);
    expect(useAppStore.getState().showCreateNote).toBe(true);
    useAppStore.getState().setShowCreateNote(false);
    expect(useAppStore.getState().showCreateNote).toBe(false);
  });

  it('should toggle create category modal', () => {
    useAppStore.getState().setShowCreateCategory(true);
    expect(useAppStore.getState().showCreateCategory).toBe(true);
  });

  it('should set editing category', () => {
    useAppStore.getState().setEditingCategory(mockCategory);
    expect(useAppStore.getState().editingCategory).toEqual(mockCategory);
  });

  it('should clear editing category', () => {
    useAppStore.setState({ editingCategory: mockCategory });
    useAppStore.getState().setEditingCategory(null);
    expect(useAppStore.getState().editingCategory).toBeNull();
  });

  it('should set deleting category', () => {
    useAppStore.getState().setDeletingCategory(mockCategory);
    expect(useAppStore.getState().deletingCategory).toEqual(mockCategory);
  });
});

// ─── Search ──────────────────────────────────────────────────────────
describe('AppStore — Search', () => {
  beforeEach(resetStore);

  it('should start with empty search', () => {
    expect(useAppStore.getState().searchQuery).toBe('');
  });

  it('should update search query', () => {
    useAppStore.getState().setSearchQuery('encryption');
    expect(useAppStore.getState().searchQuery).toBe('encryption');
  });

  it('should clear search query', () => {
    useAppStore.setState({ searchQuery: 'test' });
    useAppStore.getState().setSearchQuery('');
    expect(useAppStore.getState().searchQuery).toBe('');
  });
});

// ─── Loading & Error ─────────────────────────────────────────────────
describe('AppStore — Loading & Error', () => {
  beforeEach(resetStore);

  it('should start with loading false and no error', () => {
    expect(useAppStore.getState().loading).toBe(false);
    expect(useAppStore.getState().error).toBeNull();
  });

  it('should clear error', () => {
    useAppStore.setState({ error: 'Something went wrong' });
    useAppStore.getState().clearError();
    expect(useAppStore.getState().error).toBeNull();
  });
});
