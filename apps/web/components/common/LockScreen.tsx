'use client';

import { useState } from 'react';
import { useAppStore } from '@/store';
import { useAuthStore } from '@/store/auth';
import { createClient } from '@/lib/supabase/client';
import Logo from '@/components/common/Logo';
import { Lock, Eye, EyeOff } from 'lucide-react';
import { setupEncryptionOnLogin } from '@/lib/services/encryption';
import { fetchNotes } from '@/lib/services/notes';

interface LockScreenProps {
  onKeyDerived?: () => void;
}

export default function LockScreen({ onKeyDerived }: LockScreenProps) {
  const { theme, setLocked } = useAppStore();
  const { user, signOut } = useAuthStore();
  const isDark = theme === 'dark';

  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [lockedUntil, setLockedUntil] = useState<number | null>(null);

  const MAX_ATTEMPTS = 5;
  const LOCKOUT_SECONDS = 60;

  const primaryText = isDark ? '#E0E1DD' : '#1B263B';
  const secondaryText = isDark ? 'rgba(224,225,221,0.6)' : 'rgba(27,38,59,0.6)';
  const tertiaryText = isDark ? 'rgba(224,225,221,0.35)' : 'rgba(27,38,59,0.35)';
  const borderColor = isDark ? 'rgba(224,225,221,0.12)' : 'rgba(27,38,59,0.12)';
  const bgColor = isDark ? '#1B263B' : '#E0E1DD';
  const inputBg = isDark ? 'rgba(224,225,221,0.06)' : 'rgba(27,38,59,0.04)';

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
        // Re-derive encryption key on unlock
        await setupEncryptionOnLogin(password);

        // Verify key works by trying to decrypt existing notes
        try {
          const notes = await fetchNotes();
          const hasUndecryptable = notes.some((n) => n.title === '[Encrypted — unable to decrypt]');
          if (hasUndecryptable && notes.length > 0) {
            setError('Encryption key mismatch — some notes cannot be decrypted. Try signing out and back in.');
            setPassword('');
            return;
          }
        } catch {
          // If fetch fails, proceed anyway — network issues shouldn't block unlock
        }

        setLocked(false);
        setPassword('');
        onKeyDerived?.();
      }
    } catch {
      setError('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = () => {
    signOut().then(() => {
      setLocked(false);
      window.location.href = '/welcome';
    });
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center px-8"
      style={{ backgroundColor: bgColor }}
    >
      {/* Logo */}
      <div className="mb-6">
        <Logo size={56} />
      </div>

      {/* Lock icon */}
      <div
        className="flex items-center justify-center mb-4"
        style={{
          width: 48,
          height: 48,
          borderRadius: '50%',
          border: `1.5px solid ${borderColor}`,
        }}
      >
        <Lock size={22} strokeWidth={1.5} style={{ color: primaryText }} />
      </div>

      {/* Title */}
      <h2
        className="text-lg font-bold mb-1"
        style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: primaryText }}
      >
        Locked
      </h2>
      <p
        className="text-xs mb-6 text-center"
        style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: secondaryText }}
      >
        Enter your password to unlock
      </p>

      {/* Password input */}
      <div className="w-full max-w-[280px] relative mb-3">
        <input
          type={showPassword ? 'text' : 'password'}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleUnlock()}
          placeholder="Password"
          className="w-full px-4 py-3 pr-11 rounded-xl text-sm outline-none"
          style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            backgroundColor: inputBg,
            border: `1.5px solid ${error ? '#C45C6A' : borderColor}`,
            color: primaryText,
          }}
          autoFocus
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 -translate-y-1/2"
          style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}
        >
          {showPassword ? (
            <EyeOff size={16} strokeWidth={1.5} style={{ color: secondaryText }} />
          ) : (
            <Eye size={16} strokeWidth={1.5} style={{ color: secondaryText }} />
          )}
        </button>
      </div>

      {/* Error message */}
      {error && (
        <p
          className="text-xs mb-3"
          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: '#C45C6A' }}
        >
          {error}
        </p>
      )}

      {/* Unlock button */}
      <button
        onClick={handleUnlock}
        disabled={loading || !password.trim()}
        className="w-full max-w-[280px] py-3 rounded-xl text-sm font-bold transition-all mb-4"
        style={{
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          backgroundColor: password.trim() ? primaryText : (isDark ? 'rgba(224,225,221,0.06)' : 'rgba(27,38,59,0.04)'),
          color: password.trim() ? bgColor : tertiaryText,
          border: 'none',
          cursor: password.trim() ? 'pointer' : 'default',
          opacity: loading ? 0.6 : 1,
        }}
      >
        {loading ? 'Unlocking...' : 'Unlock'}
      </button>

      {/* Sign out link */}
      <button
        onClick={handleSignOut}
        className="text-xs font-medium"
        style={{
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          color: secondaryText,
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
        }}
      >
        Sign out instead
      </button>
    </div>
  );
}
