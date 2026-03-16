'use client';

import { useEffect } from 'react';
import { useAppStore } from '@/store';
import BottomNav from '@/components/common/BottomNav';
import FAB from '@/components/common/FAB';
import NotesScreen from '@/components/notes/NotesScreen';
import NoteEditor from '@/components/notes/NoteEditor';
import CategoriesScreen from '@/components/categories/CategoriesScreen';
import SettingsScreen from '@/components/settings/SettingsScreen';
import type { NoteDecrypted, Category } from '@safeink/shared';

// Demo data for initial experience
const DEMO_CATEGORIES: Category[] = [
  { id: 'cat-1', user_id: 'demo', name: 'Work', icon: '💼', color: '#5B9BFF', parent_id: null, sort_order: 0, created_at: '2026-03-16T10:00:00Z', updated_at: '2026-03-16T10:00:00Z' },
  { id: 'cat-2', user_id: 'demo', name: 'Personal', icon: '🏠', color: '#BEFF46', parent_id: null, sort_order: 1, created_at: '2026-03-16T10:00:00Z', updated_at: '2026-03-16T10:00:00Z' },
  { id: 'cat-3', user_id: 'demo', name: 'Ideas', icon: '💡', color: '#FFA726', parent_id: null, sort_order: 2, created_at: '2026-03-16T10:00:00Z', updated_at: '2026-03-16T10:00:00Z' },
  { id: 'cat-4', user_id: 'demo', name: 'Research', icon: '🔬', color: '#AB47BC', parent_id: null, sort_order: 3, created_at: '2026-03-16T10:00:00Z', updated_at: '2026-03-16T10:00:00Z' },
  { id: 'cat-5', user_id: 'demo', name: 'Meetings', icon: '🎯', color: '#26C6DA', parent_id: 'cat-1', sort_order: 0, created_at: '2026-03-16T10:00:00Z', updated_at: '2026-03-16T10:00:00Z' },
  { id: 'cat-6', user_id: 'demo', name: 'Projects', icon: '🚀', color: '#FF7043', parent_id: 'cat-1', sort_order: 1, created_at: '2026-03-16T10:00:00Z', updated_at: '2026-03-16T10:00:00Z' },
  { id: 'cat-7', user_id: 'demo', name: 'Health', icon: '🏋️', color: '#66BB6A', parent_id: 'cat-2', sort_order: 0, created_at: '2026-03-16T10:00:00Z', updated_at: '2026-03-16T10:00:00Z' },
];

const DEMO_NOTES: NoteDecrypted[] = [
  {
    id: 'note-1', user_id: 'demo', title: 'Q2 Product Roadmap', body: 'Key initiatives for Q2 include launching the mobile app, implementing real-time collaboration, and expanding to European markets. Priority focus on security certifications.', category_id: 'cat-1', pinned: true, archived: false, deleted_at: null, created_at: '2026-03-16T09:00:00Z', updated_at: '2026-03-16T14:30:00Z',
  },
  {
    id: 'note-2', user_id: 'demo', title: 'API Security Audit Notes', body: 'Reviewed all endpoints for rate limiting compliance. Found 3 endpoints missing proper validation. Need to add Zod schemas for: /notes/batch, /categories/import, /shares/bulk.', category_id: 'cat-6', pinned: true, archived: false, deleted_at: null, created_at: '2026-03-15T16:00:00Z', updated_at: '2026-03-16T11:00:00Z',
  },
  {
    id: 'note-3', user_id: 'demo', title: 'Encryption Architecture Review', body: 'AES-256-GCM implementation verified. Key derivation using Argon2id with 64MB memory cost. Need to implement Shamir Secret Sharing for recovery keys. Client-side WebCrypto API performance is excellent.', category_id: 'cat-4', pinned: true, archived: false, deleted_at: null, created_at: '2026-03-14T10:00:00Z', updated_at: '2026-03-16T08:45:00Z',
  },
  {
    id: 'note-4', user_id: 'demo', title: 'Weekly Standup Notes', body: 'Team updates: Backend — RLS policies complete. Frontend — Theme system implemented. Mobile — React Native setup in progress. Blockers: Waiting on Supabase Pro plan activation.', category_id: 'cat-5', pinned: false, archived: false, deleted_at: null, created_at: '2026-03-16T09:30:00Z', updated_at: '2026-03-16T09:30:00Z',
  },
  {
    id: 'note-5', user_id: 'demo', title: 'Reading List — March', body: '1. "Zero Trust Networks" by Gilman & Barth\n2. "Designing Data-Intensive Applications" — Chapter 12\n3. OWASP API Security Top 10 2023\n4. Supabase RLS documentation deep-dive', category_id: 'cat-2', pinned: false, archived: false, deleted_at: null, created_at: '2026-03-10T12:00:00Z', updated_at: '2026-03-15T18:00:00Z',
  },
  {
    id: 'note-6', user_id: 'demo', title: 'Workout Routine', body: 'Monday: Push (Chest, Shoulders, Triceps)\nWednesday: Pull (Back, Biceps)\nFriday: Legs\nSaturday: HIIT Cardio\nRemember: Track progressive overload weekly.', category_id: 'cat-7', pinned: false, archived: false, deleted_at: null, created_at: '2026-03-08T07:00:00Z', updated_at: '2026-03-14T07:00:00Z',
  },
  {
    id: 'note-7', user_id: 'demo', title: 'CRDT Sync Algorithm Ideas', body: 'Explored Yjs for real-time collaboration. Key insight: operations should be commutative and idempotent. Consider using awareness protocol for cursor presence. Need benchmarks for 50+ concurrent editors.', category_id: 'cat-3', pinned: false, archived: false, deleted_at: null, created_at: '2026-03-12T14:00:00Z', updated_at: '2026-03-13T10:00:00Z',
  },
  {
    id: 'note-8', user_id: 'demo', title: 'Tauri Desktop Packaging', body: 'Build pipeline: GitHub Actions → Tauri build → Code sign → Upload to releases. Bundle sizes: macOS .dmg ~8MB, Windows .msi ~6MB, Linux .AppImage ~12MB. Auto-updater needs custom endpoint.', category_id: 'cat-6', pinned: true, archived: false, deleted_at: null, created_at: '2026-03-11T16:00:00Z', updated_at: '2026-03-16T13:00:00Z',
  },
];

export default function AppPage() {
  const {
    activeTab, theme, setNotes, setCategories,
    showCreateNote, setShowCreateNote,
    selectedNoteId, setSelectedNoteId,
    notes, addNote, updateNote,
  } = useAppStore();

  // Initialize demo data
  useEffect(() => {
    setCategories(DEMO_CATEGORIES);
    setNotes(DEMO_NOTES);
    document.body.className = theme;
  }, []);

  // Sync theme to body
  useEffect(() => {
    document.body.className = theme;
  }, [theme]);

  const isDark = theme === 'dark';
  const selectedNote = notes.find((n) => n.id === selectedNoteId);

  const handleSaveNote = (title: string, body: string, categoryId: string | null) => {
    if (selectedNote) {
      updateNote(selectedNote.id, { title, body, category_id: categoryId, updated_at: new Date().toISOString() });
    } else {
      const newNote: NoteDecrypted = {
        id: crypto.randomUUID(),
        user_id: 'demo',
        title,
        body,
        category_id: categoryId,
        pinned: false,
        archived: false,
        deleted_at: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      addNote(newNote);
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
