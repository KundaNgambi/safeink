'use client';

import { useState } from 'react';
import { useAppStore } from '@/store';
import { Trash2 } from 'lucide-react';

interface DeleteNoteModalProps {
  noteTitle: string;
  onConfirm: () => void;
  onClose: () => void;
}

export default function DeleteNoteModal({ noteTitle, onConfirm, onClose }: DeleteNoteModalProps) {
  const { theme } = useAppStore();
  const isDark = theme === 'dark';
  const [deleting, setDeleting] = useState(false);

  const primaryText = isDark ? '#E0E1DD' : '#1B263B';
  const secondaryText = isDark ? 'rgba(224,225,221,0.6)' : 'rgba(27,38,59,0.6)';
  const borderColor = isDark ? 'rgba(224,225,221,0.12)' : 'rgba(27,38,59,0.12)';
  const overlayBg = isDark ? 'rgba(27,38,59,0.85)' : 'rgba(0,0,0,0.5)';
  const modalBg = isDark ? '#243447' : '#FFFFFF';

  const handleDelete = async () => {
    setDeleting(true);
    onConfirm();
  };

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center px-6"
      style={{ backgroundColor: overlayBg }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-[320px] rounded-2xl p-6 flex flex-col items-center"
        style={{ backgroundColor: modalBg, border: `1px solid ${borderColor}` }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Trash icon */}
        <div
          className="flex items-center justify-center mb-4"
          style={{
            width: 44,
            height: 44,
            borderRadius: '50%',
            backgroundColor: 'rgba(196,92,106,0.12)',
          }}
        >
          <Trash2 size={20} strokeWidth={1.5} style={{ color: '#C45C6A' }} />
        </div>

        <h3
          className="text-base font-bold mb-1"
          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: primaryText }}
        >
          Delete Note
        </h3>
        <p
          className="text-xs mb-5 text-center leading-relaxed"
          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: secondaryText }}
        >
          Are you sure you want to delete &ldquo;{noteTitle}&rdquo;? This can&apos;t be undone.
        </p>

        <div className="flex gap-3 w-full">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold"
            style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              backgroundColor: 'transparent',
              border: `1.5px solid ${borderColor}`,
              color: secondaryText,
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="flex-1 py-2.5 rounded-xl text-sm font-bold transition-all"
            style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              backgroundColor: '#C45C6A',
              color: '#FFFFFF',
              border: 'none',
              cursor: 'pointer',
              opacity: deleting ? 0.6 : 1,
            }}
          >
            {deleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}
