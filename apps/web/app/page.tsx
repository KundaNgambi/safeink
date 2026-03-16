'use client';

import { useEffect } from 'react';
import { useAppStore } from '@/store';
import { useAuthStore } from '@/store/auth';
import BottomNav from '@/components/common/BottomNav';
import FAB from '@/components/common/FAB';
import NotesScreen from '@/components/notes/NotesScreen';
import NoteEditor from '@/components/notes/NoteEditor';
import CategoriesScreen from '@/components/categories/CategoriesScreen';
import SettingsScreen from '@/components/settings/SettingsScreen';
import Toast from '@/components/common/Toast';

export default function AppPage() {
  const {
    activeTab, theme, loading,
    showCreateNote, setShowCreateNote,
    selectedNoteId, setSelectedNoteId,
    notes, loadNotes, loadCategories,
    createNoteAsync, updateNoteAsync,
  } = useAppStore();
  const user = useAuthStore((s) => s.user);

  // Load data from Supabase when user is authenticated
  useEffect(() => {
    if (user) {
      loadNotes();
      loadCategories();
    }
  }, [user, loadNotes, loadCategories]);

  // Sync theme to body
  useEffect(() => {
    document.body.className = theme;
  }, [theme]);

  const isDark = theme === 'dark';
  const selectedNote = notes.find((n) => n.id === selectedNoteId);

  const handleSaveNote = async (title: string, body: string, categoryId: string | null) => {
    if (selectedNote) {
      await updateNoteAsync(selectedNote.id, { title, body, category_id: categoryId });
    } else {
      await createNoteAsync(title, body, categoryId);
    }
    setShowCreateNote(false);
    setSelectedNoteId(null);
  };

  return (
    <div
      className="h-screen w-screen overflow-hidden flex flex-col"
      style={{ backgroundColor: isDark ? '#0f1117' : '#F4F5F7' }}
    >
      {/* Main content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'notes' && <NotesScreen />}
        {activeTab === 'categories' && <CategoriesScreen />}
        {activeTab === 'settings' && <SettingsScreen />}
      </div>

      {/* Bottom navigation */}
      <BottomNav />

      {/* FAB */}
      <FAB />

      {/* Error toast */}
      <Toast />

      {/* Note editor overlay */}
      {(showCreateNote || selectedNoteId) && (
        <NoteEditor
          note={selectedNote}
          onSave={handleSaveNote}
          onClose={() => {
            setShowCreateNote(false);
            setSelectedNoteId(null);
          }}
        />
      )}
    </div>
  );
}
