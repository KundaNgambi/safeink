'use client';

import { useState } from 'react';
import { useAppStore } from '@/store';
import { useAuthStore } from '@/store/auth';
import { createClient } from '@/lib/supabase/client';
import { Lock } from 'lucide-react';

interface NoteUnlockModalProps {
  onUnlock: () => void;
  onClose: () => void;
}

export default function NoteUnlockModal({ onUnlock, onClose }: NoteUnlockModalProps) {
  const { theme } = useAppStore();
  const { user } = useAuthStore();
  const isDark = theme === 'dark';

  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [lockedUntil, setLockedUntil] = useState<number | null>(null);

  const primaryText = isDark ? '#E0E1DD' : '#1B263B';
  const secondaryText = isDark ? 'rgba(224,225,221,0.6)' : 'rgba(27,38,59,0.6)';
  const tertiaryText = isDark ? 'rgba(224,225,221,0.35)' : 'rgba(27,38,59,0.35)';
  const borderColor = isDark ? 'rgba(224,225,221,0.12)' : 'rgba(27,38,59,0.12)';
  const overlayBg = isDark ? 'rgba(27,38,59,0.85)' : 'rgba(0,0,0,0.5)';
  const modalBg = isDark ? '#243447' : '#FFFFFF';
  const inputBg = isDark ? 'rgba(224,225,221,0.06)' : 'rgba(27,38,59,0.04)';

  const MAX_ATTEMPTS = 5;
  const LOCKOUT_SECONDS = 30;

  const handleUnlock = async () => {
    if (!password.trim() || !user?.email) return;

    // Check lockout
    if (lockedUntil && Date.now() < lockedUntil) {
      const remaining = Math.ceil((lockedUntil - Date.now()) / 1000);
      setError(`Too many attempts. Try again in ${remaining}s`);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const supabase = createClient();
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password,
      });

      if (authError) {
        const newAttempts = attempts + 1;
        setAttempts(newAttempts);
        if (newAttempts >= MAX_ATTEMPTS) {
          setLockedUntil(Date.now() + LOCKOUT_SECONDS * 1000);
          setError(`Too many attempts. Locked for ${LOCKOUT_SECONDS}s`);
          setAttempts(0);
        } else {
          setError(`Incorrect password (${MAX_ATTEMPTS - newAttempts} attempts left)`);
        }
        setPassword('');
      } else {
        onUnlock();
      }
    } catch {
      setError('Something went wrong');
    } finally {
      setLoading(false);
    }
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
        {/* Lock icon */}
        <div
          className="flex items-center justify-center mb-4"
          style={{
            width: 44,
            height: 44,
            borderRadius: '50%',
            border: `1.5px solid ${borderColor}`,
          }}
        >
          <Lock size={20} strokeWidth={1.5} style={{ color: primaryText }} />
        </div>

        <h3
          className="text-base font-bold mb-1"
          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: primaryText }}
        >
          Locked Note
        </h3>
        <p
          className="text-xs mb-5 text-center"
          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: secondaryText }}
        >
          Enter your password to view this note
        </p>

        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleUnlock()}
          placeholder="Password"
          className="w-full px-4 py-3 rounded-xl text-sm outline-none mb-3"
          style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            backgroundColor: inputBg,
            border: `1.5px solid ${error ? '#C45C6A' : borderColor}`,
            color: primaryText,
          }}
          autoFocus
        />

        {error && (
          <p
            className="text-xs mb-3 text-center"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: '#C45C6A' }}
          >
            {error}
          </p>
        )}

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
            onClick={handleUnlock}
            disabled={loading || !password.trim()}
            className="flex-1 py-2.5 rounded-xl text-sm font-bold transition-all"
            style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              backgroundColor: password.trim() ? primaryText : (isDark ? 'rgba(224,225,221,0.06)' : 'rgba(27,38,59,0.04)'),
              color: password.trim() ? modalBg : tertiaryText,
              border: 'none',
              cursor: password.trim() ? 'pointer' : 'default',
              opacity: loading ? 0.6 : 1,
            }}
          >
            {loading ? 'Verifying...' : 'Unlock'}
          </button>
        </div>
      </div>
    </div>
  );
}
