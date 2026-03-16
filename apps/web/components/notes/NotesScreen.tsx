'use client';

import { useMemo } from 'react';
import { useAppStore } from '@/store';
import Logo from '@/components/common/Logo';
import ThemeToggle from '@/components/common/ThemeToggle';
import NoteCardPinned from './NoteCardPinned';
import NoteCardRecent from './NoteCardRecent';
import { Search, X, Lock } from 'lucide-react';

export default function NotesScreen() {
  const { theme, notes, categories, activeCategoryFilter, setActiveCategoryFilter, searchQuery, setSearchQuery, loading } = useAppStore();
  const isDark = theme === 'dark';

  const filteredNotes = useMemo(() => {
    let filtered = notes.filter((n) => !n.deleted_at && !n.archived);

    if (activeCategoryFilter) {
      const childIds = categories
        .filter((c) => c.parent_id === activeCategoryFilter)
        .map((c) => c.id);
      const grandchildIds = categories
        .filter((c) => childIds.includes(c.parent_id || ''))
        .map((c) => c.id);
      const allIds = [activeCategoryFilter, ...childIds, ...grandchildIds];
      filtered = filtered.filter((n) => n.category_id && allIds.includes(n.category_id));
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (n) => n.title.toLowerCase().includes(q) || n.body.toLowerCase().includes(q)
      );
    }

    return filtered;
  }, [notes, activeCategoryFilter, categories, searchQuery]);

  const pinnedNotes = filteredNotes.filter((n) => n.pinned);
  const recentNotes = filteredNotes.filter((n) => !n.pinned);
  const topCategories = categories.filter((c) => !c.parent_id);

  const borderColor = isDark ? 'rgba(224,225,221,0.12)' : 'rgba(27,38,59,0.12)';
  const secondaryText = isDark ? 'rgba(224,225,221,0.6)' : 'rgba(27,38,59,0.6)';
  const primaryText = isDark ? '#E0E1DD' : '#1B263B';
  const cardBg = isDark ? '#243447' : '#FFFFFF';
  const cardBorder = isDark ? 'rgba(224,225,221,0.1)' : 'rgba(27,38,59,0.1)';

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-5 pt-5 pb-3 flex items-center justify-between">
        <Logo size={32} />
        <ThemeToggle />
      </div>

      {/* Search */}
      <div className="px-5 pb-3">
        <div
          className="flex items-center gap-3 px-4 py-3 rounded-2xl"
          style={{
            backgroundColor: cardBg,
            border: `1px solid ${cardBorder}`,
          }}
        >
          <Search size={16} style={{ color: secondaryText }} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search encrypted notes..."
            className="flex-1 bg-transparent outline-none text-sm font-body"
            style={{
              color: primaryText,
              fontFamily: "'Plus Jakarta Sans', sans-serif",
            }}
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} style={{ color: secondaryText }}>
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Category filter pills */}
      <div className="px-5 pb-3 overflow-x-auto flex gap-2">
        <button
          onClick={() => setActiveCategoryFilter(null)}
          className="flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-body font-semibold transition-all"
          style={{
            backgroundColor: !activeCategoryFilter ? primaryText : 'transparent',
            color: !activeCategoryFilter ? (isDark ? '#1B263B' : '#E0E1DD') : secondaryText,
            border: `1.5px solid ${!activeCategoryFilter ? primaryText : borderColor}`,
            fontFamily: "'Plus Jakarta Sans', sans-serif",
          }}
        >
          All ({filteredNotes.length})
        </button>
        {topCategories.map((cat) => {
          const isActive = activeCategoryFilter === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategoryFilter(isActive ? null : cat.id)}
              className="flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-body font-semibold transition-all whitespace-nowrap"
              style={{
                backgroundColor: isActive ? primaryText : 'transparent',
                color: isActive ? (isDark ? '#1B263B' : '#E0E1DD') : secondaryText,
                border: `1.5px solid ${isActive ? primaryText : borderColor}`,
                fontFamily: "'Plus Jakarta Sans', sans-serif",
              }}
            >
              {cat.name}
            </button>
          );
        })}
      </div>

      {/* Notes list */}
      <div className="flex-1 overflow-auto px-5 pb-24">
        {/* Loading skeleton */}
        {loading && notes.length === 0 && (
          <div className="flex flex-col gap-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="rounded-2xl p-4 animate-pulse"
                style={{
                  backgroundColor: cardBg,
                  border: `1px solid ${cardBorder}`,
                }}
              >
                <div className="h-4 rounded-lg mb-3" style={{ backgroundColor: isDark ? 'rgba(224,225,221,0.1)' : 'rgba(27,38,59,0.08)', width: '60%' }} />
                <div className="h-3 rounded-lg mb-2" style={{ backgroundColor: isDark ? 'rgba(224,225,221,0.06)' : 'rgba(27,38,59,0.04)', width: '100%' }} />
                <div className="h-3 rounded-lg" style={{ backgroundColor: isDark ? 'rgba(224,225,221,0.06)' : 'rgba(27,38,59,0.04)', width: '75%' }} />
              </div>
            ))}
          </div>
        )}

        {/* Pinned section */}
        {!loading && pinnedNotes.length > 0 && (
          <>
            <div className="flex items-center gap-2 mb-3">
              <span
                className="font-body font-bold uppercase"
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: secondaryText,
                  letterSpacing: '1.5px',
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                }}
              >
                PINNED
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-5">
              {pinnedNotes.map((note) => (
                <NoteCardPinned key={note.id} note={note} />
              ))}
            </div>
          </>
        )}

        {/* Recent section */}
        {!loading && recentNotes.length > 0 && (
          <>
            <div className="flex items-center gap-2 mb-3">
              <span
                className="font-body font-bold uppercase"
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: secondaryText,
                  letterSpacing: '1.5px',
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                }}
              >
                RECENT
              </span>
            </div>
            <div className="flex flex-col gap-3">
              {recentNotes.map((note) => (
                <NoteCardRecent key={note.id} note={note} />
              ))}
            </div>
          </>
        )}

        {!loading && filteredNotes.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20">
            <Lock size={40} style={{ color: secondaryText, marginBottom: 16 }} />
            <h3
              className="text-lg font-display font-bold mb-2"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: primaryText }}
            >
              {searchQuery ? 'No notes found' : 'No notes yet'}
            </h3>
            <p
              className="text-sm font-body text-center"
              style={{ color: secondaryText, fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              {searchQuery ? 'Try a different search term' : 'Tap + to create your first encrypted note'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
