import { create } from 'zustand';
import type { NoteDecrypted, Category } from '@safeink/shared';
import * as notesService from '@/lib/services/notes';
import * as categoriesService from '@/lib/services/categories';

type Tab = 'notes' | 'categories' | 'settings';

interface AppState {
  // Theme
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  setTheme: (theme: 'dark' | 'light') => void;

  // Navigation
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;

  // Loading & errors
  loading: boolean;
  error: string | null;
  clearError: () => void;

  // Notes
  notes: NoteDecrypted[];
  setNotes: (notes: NoteDecrypted[]) => void;
  addNote: (note: NoteDecrypted) => void;
  updateNote: (id: string, updates: Partial<NoteDecrypted>) => void;
  deleteNote: (id: string) => void;
  selectedNoteId: string | null;
  setSelectedNoteId: (id: string | null) => void;

  // Async note operations (Supabase + E2EE)
  loadNotes: () => Promise<void>;
  createNoteAsync: (title: string, body: string, categoryId: string | null) => Promise<NoteDecrypted | null>;
  updateNoteAsync: (id: string, updates: Partial<Pick<NoteDecrypted, 'title' | 'body' | 'category_id' | 'pinned' | 'archived'>>) => Promise<void>;
  deleteNoteAsync: (id: string) => Promise<void>;

  // Categories
  categories: Category[];
  setCategories: (categories: Category[]) => void;
  addCategory: (category: Category) => void;
  updateCategory: (id: string, updates: Partial<Category>) => void;
  deleteCategory: (id: string) => void;
  activeCategoryFilter: string | null;
  setActiveCategoryFilter: (id: string | null) => void;

  // Async category operations (Supabase)
  loadCategories: () => Promise<void>;
  createCategoryAsync: (name: string, icon: string, color: string, parentId: string | null) => Promise<Category | null>;
  updateCategoryAsync: (id: string, updates: Partial<Pick<Category, 'name' | 'icon' | 'color'>>) => Promise<void>;
  deleteCategoryAsync: (id: string, reassignTo: string | null) => Promise<void>;

  // Modals
  showCreateNote: boolean;
  setShowCreateNote: (show: boolean) => void;
  showCreateCategory: boolean;
  setShowCreateCategory: (show: boolean) => void;
  editingCategory: Category | null;
  setEditingCategory: (category: Category | null) => void;
  deletingCategory: Category | null;
  setDeletingCategory: (category: Category | null) => void;

  // Search
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  // Theme
  theme: 'dark',
  toggleTheme: () => set((state) => ({ theme: state.theme === 'dark' ? 'light' : 'dark' })),
  setTheme: (theme) => set({ theme }),

  // Navigation
  activeTab: 'notes',
  setActiveTab: (tab) => set({ activeTab: tab, selectedNoteId: null }),

  // Loading & errors
  loading: false,
  error: null,
  clearError: () => set({ error: null }),

  // Notes (local state)
  notes: [],
  setNotes: (notes) => set({ notes }),
  addNote: (note) => set((state) => ({ notes: [note, ...state.notes] })),
  updateNote: (id, updates) =>
    set((state) => ({
      notes: state.notes.map((n) => (n.id === id ? { ...n, ...updates } : n)),
    })),
  deleteNote: (id) =>
    set((state) => ({
      notes: state.notes.filter((n) => n.id !== id),
      selectedNoteId: state.selectedNoteId === id ? null : state.selectedNoteId,
    })),
  selectedNoteId: null,
  setSelectedNoteId: (id) => set({ selectedNoteId: id }),

  // Async note operations
  loadNotes: async () => {
    set({ loading: true, error: null });
    try {
      const notes = await notesService.fetchNotes();
      set({ notes, loading: false });
    } catch (err) {
      set({ error: (err as Error).message, loading: false });
    }
  },

  createNoteAsync: async (title, body, categoryId) => {
    try {
      const note = await notesService.createNote(title, body, categoryId);
      set((state) => ({ notes: [note, ...state.notes] }));
      return note;
    } catch (err) {
      set({ error: (err as Error).message });
      return null;
    }
  },

  updateNoteAsync: async (id, updates) => {
    // Optimistic update
    const prev = get().notes;
    set((state) => ({
      notes: state.notes.map((n) => (n.id === id ? { ...n, ...updates } : n)),
    }));
    try {
      const updated = await notesService.updateNote(id, updates);
      set((state) => ({
        notes: state.notes.map((n) => (n.id === id ? updated : n)),
      }));
    } catch (err) {
      // Rollback on error
      set({ notes: prev, error: (err as Error).message });
    }
  },

  deleteNoteAsync: async (id) => {
    const prev = get().notes;
    set((state) => ({
      notes: state.notes.filter((n) => n.id !== id),
      selectedNoteId: state.selectedNoteId === id ? null : state.selectedNoteId,
    }));
    try {
      await notesService.deleteNote(id);
    } catch (err) {
      set({ notes: prev, error: (err as Error).message });
    }
  },

  // Categories (local state)
  categories: [],
  setCategories: (categories) => set({ categories }),
  addCategory: (category) => set((state) => ({ categories: [...state.categories, category] })),
  updateCategory: (id, updates) =>
    set((state) => ({
      categories: state.categories.map((c) => (c.id === id ? { ...c, ...updates } : c)),
    })),
  deleteCategory: (id) =>
    set((state) => ({
      categories: state.categories.filter((c) => c.id !== id && c.parent_id !== id),
      activeCategoryFilter: state.activeCategoryFilter === id ? null : state.activeCategoryFilter,
    })),
  activeCategoryFilter: null,
  setActiveCategoryFilter: (id) => set({ activeCategoryFilter: id }),

  // Async category operations
  loadCategories: async () => {
    try {
      const categories = await categoriesService.fetchCategories();
      set({ categories });
    } catch (err) {
      set({ error: (err as Error).message });
    }
  },

  createCategoryAsync: async (name, icon, color, parentId) => {
    try {
      const category = await categoriesService.createCategory(name, icon, color, parentId);
      set((state) => ({ categories: [...state.categories, category] }));
      return category;
    } catch (err) {
      set({ error: (err as Error).message });
      return null;
    }
  },

  updateCategoryAsync: async (id, updates) => {
    const prev = get().categories;
    set((state) => ({
      categories: state.categories.map((c) => (c.id === id ? { ...c, ...updates } : c)),
    }));
    try {
      const updated = await categoriesService.updateCategory(id, updates);
      set((state) => ({
        categories: state.categories.map((c) => (c.id === id ? updated : c)),
      }));
    } catch (err) {
      set({ categories: prev, error: (err as Error).message });
    }
  },

  deleteCategoryAsync: async (id, reassignTo) => {
    const prev = get().categories;
    set((state) => ({
      categories: state.categories.filter((c) => c.id !== id && c.parent_id !== id),
      activeCategoryFilter: state.activeCategoryFilter === id ? null : state.activeCategoryFilter,
    }));
    try {
      await categoriesService.deleteCategory(id, reassignTo);
    } catch (err) {
      set({ categories: prev, error: (err as Error).message });
    }
  },

  // Modals
  showCreateNote: false,
  setShowCreateNote: (show) => set({ showCreateNote: show }),
  showCreateCategory: false,
  setShowCreateCategory: (show) => set({ showCreateCategory: show }),
  editingCategory: null,
  setEditingCategory: (category) => set({ editingCategory: category }),
  deletingCategory: null,
  setDeletingCategory: (category) => set({ deletingCategory: category }),

  // Search
  searchQuery: '',
  setSearchQuery: (query) => set({ searchQuery: query }),
}));
