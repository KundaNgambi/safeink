import { create } from 'zustand';
import type { NoteDecrypted, Category } from '@safeink/shared';

type Tab = 'notes' | 'categories' | 'settings';

interface AppState {
  // Theme
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  setTheme: (theme: 'dark' | 'light') => void;

  // Navigation
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;

  // Notes
  notes: NoteDecrypted[];
  setNotes: (notes: NoteDecrypted[]) => void;
  addNote: (note: NoteDecrypted) => void;
  updateNote: (id: string, updates: Partial<NoteDecrypted>) => void;
  deleteNote: (id: string) => void;
  selectedNoteId: string | null;
  setSelectedNoteId: (id: string | null) => void;

  // Categories
  categories: Category[];
  setCategories: (categories: Category[]) => void;
  addCategory: (category: Category) => void;
  updateCategory: (id: string, updates: Partial<Category>) => void;
  deleteCategory: (id: string) => void;
  activeCategoryFilter: string | null;
  setActiveCategoryFilter: (id: string | null) => void;

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

export const useAppStore = create<AppState>((set) => ({
  // Theme
  theme: 'dark',
  toggleTheme: () => set((state) => ({ theme: state.theme === 'dark' ? 'light' : 'dark' })),
  setTheme: (theme) => set({ theme }),

  // Navigation
  activeTab: 'notes',
  setActiveTab: (tab) => set({ activeTab: tab, selectedNoteId: null }),

  // Notes
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

  // Categories
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
