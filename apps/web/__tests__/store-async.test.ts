import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { NoteDecrypted, Category } from '@safeink/shared';

// Mock service modules
vi.mock('@/lib/services/notes', () => ({
  fetchNotes: vi.fn(),
  createNote: vi.fn(),
  updateNote: vi.fn(),
  deleteNote: vi.fn(),
}));

vi.mock('@/lib/services/categories', () => ({
  fetchCategories: vi.fn(),
  createCategory: vi.fn(),
  updateCategory: vi.fn(),
  deleteCategory: vi.fn(),
}));

import { useAppStore } from '../store';
import * as notesService from '../lib/services/notes';
import * as categoriesService from '../lib/services/categories';

const mockFetchNotes = notesService.fetchNotes as ReturnType<typeof vi.fn>;
const mockCreateNote = notesService.createNote as ReturnType<typeof vi.fn>;
const mockUpdateNote = notesService.updateNote as ReturnType<typeof vi.fn>;
const mockDeleteNote = notesService.deleteNote as ReturnType<typeof vi.fn>;

const mockFetchCategories = categoriesService.fetchCategories as ReturnType<typeof vi.fn>;
const mockCreateCategory = categoriesService.createCategory as ReturnType<typeof vi.fn>;
const mockUpdateCategory = categoriesService.updateCategory as ReturnType<typeof vi.fn>;
const mockDeleteCategory = categoriesService.deleteCategory as ReturnType<typeof vi.fn>;

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

// ─── Async Note Operations ──────────────────────────────────────────
describe('AppStore — Async Notes', () => {
  beforeEach(() => {
    resetStore();
    vi.clearAllMocks();
  });

  it('loadNotes should fetch and set notes', async () => {
    mockFetchNotes.mockResolvedValue([mockNote]);

    await useAppStore.getState().loadNotes();

    expect(mockFetchNotes).toHaveBeenCalled();
    expect(useAppStore.getState().notes).toEqual([mockNote]);
    expect(useAppStore.getState().loading).toBe(false);
  });

  it('loadNotes should set loading while fetching', async () => {
    let resolvePromise: (v: NoteDecrypted[]) => void;
    mockFetchNotes.mockReturnValue(new Promise((r) => { resolvePromise = r; }));

    const promise = useAppStore.getState().loadNotes();
    expect(useAppStore.getState().loading).toBe(true);

    resolvePromise!([]);
    await promise;
    expect(useAppStore.getState().loading).toBe(false);
  });

  it('loadNotes should set error on failure', async () => {
    mockFetchNotes.mockRejectedValue(new Error('Network error'));

    await useAppStore.getState().loadNotes();

    expect(useAppStore.getState().error).toBe('Network error');
    expect(useAppStore.getState().loading).toBe(false);
  });

  it('createNoteAsync should add note to store', async () => {
    mockCreateNote.mockResolvedValue(mockNote);

    const result = await useAppStore.getState().createNoteAsync('Test Note', 'Test body', null);

    expect(result).toEqual(mockNote);
    expect(useAppStore.getState().notes[0]).toEqual(mockNote);
    expect(mockCreateNote).toHaveBeenCalledWith('Test Note', 'Test body', null);
  });

  it('createNoteAsync should return null on error', async () => {
    mockCreateNote.mockRejectedValue(new Error('Create failed'));

    const result = await useAppStore.getState().createNoteAsync('Test', 'Body', null);

    expect(result).toBeNull();
    expect(useAppStore.getState().error).toBe('Create failed');
  });

  it('updateNoteAsync should optimistically update and then replace with server data', async () => {
    useAppStore.setState({ notes: [mockNote] });
    const serverNote = { ...mockNote, title: 'Server Title', updated_at: '2026-03-16T11:00:00Z' };
    mockUpdateNote.mockResolvedValue(serverNote);

    await useAppStore.getState().updateNoteAsync('note-1', { title: 'New Title' });

    expect(useAppStore.getState().notes[0].title).toBe('Server Title');
  });

  it('updateNoteAsync should rollback on error', async () => {
    useAppStore.setState({ notes: [mockNote] });
    mockUpdateNote.mockRejectedValue(new Error('Update failed'));

    await useAppStore.getState().updateNoteAsync('note-1', { title: 'New Title' });

    // Should rollback to original
    expect(useAppStore.getState().notes[0].title).toBe('Test Note');
    expect(useAppStore.getState().error).toBe('Update failed');
  });

  it('deleteNoteAsync should remove note optimistically', async () => {
    useAppStore.setState({ notes: [mockNote] });
    mockDeleteNote.mockResolvedValue(undefined);

    await useAppStore.getState().deleteNoteAsync('note-1');

    expect(useAppStore.getState().notes).toHaveLength(0);
  });

  it('deleteNoteAsync should rollback on error', async () => {
    useAppStore.setState({ notes: [mockNote] });
    mockDeleteNote.mockRejectedValue(new Error('Delete failed'));

    await useAppStore.getState().deleteNoteAsync('note-1');

    expect(useAppStore.getState().notes).toHaveLength(1);
    expect(useAppStore.getState().error).toBe('Delete failed');
  });

  it('deleteNoteAsync should clear selectedNoteId when deleting selected note', async () => {
    useAppStore.setState({ notes: [mockNote], selectedNoteId: 'note-1' });
    mockDeleteNote.mockResolvedValue(undefined);

    await useAppStore.getState().deleteNoteAsync('note-1');

    expect(useAppStore.getState().selectedNoteId).toBeNull();
  });
});

// ─── Async Category Operations ──────────────────────────────────────
describe('AppStore — Async Categories', () => {
  beforeEach(() => {
    resetStore();
    vi.clearAllMocks();
  });

  it('loadCategories should fetch and set categories', async () => {
    mockFetchCategories.mockResolvedValue([mockCategory]);

    await useAppStore.getState().loadCategories();

    expect(useAppStore.getState().categories).toEqual([mockCategory]);
  });

  it('loadCategories should set error on failure', async () => {
    mockFetchCategories.mockRejectedValue(new Error('Fetch failed'));

    await useAppStore.getState().loadCategories();

    expect(useAppStore.getState().error).toBe('Fetch failed');
  });

  it('createCategoryAsync should add category to store', async () => {
    mockCreateCategory.mockResolvedValue(mockCategory);

    const result = await useAppStore.getState().createCategoryAsync('Work', '💼', '#5B9BFF', null);

    expect(result).toEqual(mockCategory);
    expect(useAppStore.getState().categories).toHaveLength(1);
  });

  it('createCategoryAsync should return null on error', async () => {
    mockCreateCategory.mockRejectedValue(new Error('Create failed'));

    const result = await useAppStore.getState().createCategoryAsync('Work', '💼', '#5B9BFF', null);

    expect(result).toBeNull();
    expect(useAppStore.getState().error).toBe('Create failed');
  });

  it('updateCategoryAsync should optimistically update', async () => {
    useAppStore.setState({ categories: [mockCategory] });
    const serverCat = { ...mockCategory, name: 'Server Name' };
    mockUpdateCategory.mockResolvedValue(serverCat);

    await useAppStore.getState().updateCategoryAsync('cat-1', { name: 'New Name' });

    expect(useAppStore.getState().categories[0].name).toBe('Server Name');
  });

  it('updateCategoryAsync should rollback on error', async () => {
    useAppStore.setState({ categories: [mockCategory] });
    mockUpdateCategory.mockRejectedValue(new Error('Update failed'));

    await useAppStore.getState().updateCategoryAsync('cat-1', { name: 'New Name' });

    expect(useAppStore.getState().categories[0].name).toBe('Work');
    expect(useAppStore.getState().error).toBe('Update failed');
  });

  it('deleteCategoryAsync should remove category optimistically', async () => {
    useAppStore.setState({ categories: [mockCategory] });
    mockDeleteCategory.mockResolvedValue(undefined);

    await useAppStore.getState().deleteCategoryAsync('cat-1', null);

    expect(useAppStore.getState().categories).toHaveLength(0);
  });

  it('deleteCategoryAsync should rollback on error', async () => {
    useAppStore.setState({ categories: [mockCategory] });
    mockDeleteCategory.mockRejectedValue(new Error('Delete failed'));

    await useAppStore.getState().deleteCategoryAsync('cat-1', null);

    expect(useAppStore.getState().categories).toHaveLength(1);
    expect(useAppStore.getState().error).toBe('Delete failed');
  });

  it('deleteCategoryAsync should clear activeCategoryFilter when deleting filtered category', async () => {
    useAppStore.setState({ categories: [mockCategory], activeCategoryFilter: 'cat-1' });
    mockDeleteCategory.mockResolvedValue(undefined);

    await useAppStore.getState().deleteCategoryAsync('cat-1', null);

    expect(useAppStore.getState().activeCategoryFilter).toBeNull();
  });
});
