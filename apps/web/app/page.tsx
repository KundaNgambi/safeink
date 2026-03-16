'use client';

import { useEffect, useState } from 'react';
import { useAppStore } from '@/store';
import { useAuthStore } from '@/store/auth';
import BottomNav from '@/components/common/BottomNav';
import FAB from '@/components/common/FAB';
import NotesScreen from '@/components/notes/NotesScreen';
import NoteEditor from '@/components/notes/NoteEditor';
import CategoriesScreen from '@/components/categories/CategoriesScreen';
import SettingsScreen from '@/components/settings/SettingsScreen';
import Toast from '@/components/common/Toast';
import AutoLockProvider from '@/components/providers/AutoLock';
import LockScreen from '@/components/common/LockScreen';
import EncryptionSetup from '@/components/common/EncryptionSetup';
import { setupEncryptionOnLogin, setupEncryptionOnSignup } from '@/lib/services/encryption';

export default function AppPage() {
  const {
    activeTab, theme, loading,
    showCreateNote, setShowCreateNote,
    selectedNoteId, setSelectedNoteId,
    notes, loadNotes, loadCategories,
    createNoteAsync, updateNoteAsync,
    isLocked,
  } = useAppStore();
  const user = useAuthStore((s) => s.user);
  const [needsEncryptionKey, setNeedsEncryptionKey] = useState(() => {
    if (typeof window === 'undefined') return false;
    return !sessionStorage.getItem('obscura_enc_key');
  });

  // Auto-derive encryption key from pending password (after email confirmation or MFA)
  useEffect(() => {
    if (!user || !needsEncryptionKey) return;
    const pendingPw = sessionStorage.getItem('obscura_pending_pw');
    if (!pendingPw) return;

    sessionStorage.removeItem('obscura_pending_pw');
    const hasSalt = !!user.user_metadata?.encryption_salt;
    const derive = hasSalt
      ? setupEncryptionOnLogin(pendingPw)
      : setupEncryptionOnSignup(pendingPw);
    derive.then(() => setNeedsEncryptionKey(false)).catch(() => {});
  }, [user, needsEncryptionKey]);

  // Load data from Supabase when user is authenticated and has encryption key
  useEffect(() => {
    if (user && !needsEncryptionKey) {
      loadNotes();
      loadCategories();
    }
  }, [user, needsEncryptionKey, loadNotes, loadCategories]);

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
    <AutoLockProvider>
      <div
        className="h-screen w-screen overflow-hidden flex flex-col"
        style={{ backgroundColor: isDark ? '#1B263B' : '#E0E1DD' }}
      >
        {/* Lock/encryption overlay */}
        {(isLocked || (user && needsEncryptionKey)) && (() => {
          const isOAuth = user?.app_metadata?.provider && user.app_metadata.provider !== 'email';
          // OAuth users without encryption key → show encryption setup
          if (needsEncryptionKey && isOAuth && !isLocked) {
            return <EncryptionSetup onComplete={() => setNeedsEncryptionKey(false)} />;
          }
          // All other cases (locked, or email user needs key) → lock screen
          return <LockScreen onKeyDerived={() => setNeedsEncryptionKey(false)} />;
        })()}

        {/* Main content */}
        <div className="flex-1 overflow-hidden">
          {activeTab === 'notes' && <NotesScreen />}
          {activeTab === 'categories' && <CategoriesScreen />}
          {activeTab === 'settings' && <SettingsScreen />}
        </div>

        {/* Bottom navigation — hidden when editor is open */}
        {!showCreateNote && !selectedNoteId && <BottomNav />}

        {/* FAB — hidden when editor is open */}
        {!showCreateNote && !selectedNoteId && <FAB />}

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
    </AutoLockProvider>
  );
}
