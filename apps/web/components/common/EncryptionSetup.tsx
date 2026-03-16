'use client';

import { useState } from 'react';
import { useAppStore } from '@/store';
import Logo from '@/components/common/Logo';
import { Shield, Eye, EyeOff } from 'lucide-react';
import { setupEncryptionOnSignup, setupEncryptionOnLogin } from '@/lib/services/encryption';
import { useAuthStore } from '@/store/auth';

interface EncryptionSetupProps {
  onComplete: () => void;
}

export default function EncryptionSetup({ onComplete }: EncryptionSetupProps) {
  const { theme } = useAppStore();
  const user = useAuthStore((s) => s.user);
  const isDark = theme === 'dark';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const hasSalt = !!user?.user_metadata?.encryption_salt;

  const primaryText = isDark ? '#E0E1DD' : '#1B263B';
  const secondaryText = isDark ? 'rgba(224,225,221,0.6)' : 'rgba(27,38,59,0.6)';
  const tertiaryText = isDark ? 'rgba(224,225,221,0.35)' : 'rgba(27,38,59,0.35)';
  const borderColor = isDark ? 'rgba(224,225,221,0.12)' : 'rgba(27,38,59,0.12)';
  const bgColor = isDark ? '#1B263B' : '#E0E1DD';
  const inputBg = isDark ? 'rgba(224,225,221,0.06)' : 'rgba(27,38,59,0.04)';

  const handleSetup = async () => {
    if (!password.trim()) return;

    if (hasSalt) {
      // User already has a salt — just derive the key
      setLoading(true);
      setError('');
      try {
        await setupEncryptionOnLogin(password);
        onComplete();
      } catch {
        setError('Failed to derive encryption key. Check your encryption password.');
      } finally {
        setLoading(false);
      }
      return;
    }

    // New setup — require confirmation
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await setupEncryptionOnSignup(password);
      onComplete();
    } catch {
      setError('Failed to set up encryption');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center px-8"
      style={{ backgroundColor: bgColor }}
    >
      <div className="mb-6">
        <Logo size={56} />
      </div>

      <div
        className="flex items-center justify-center mb-4"
        style={{
          width: 48,
          height: 48,
          borderRadius: '50%',
          border: `1.5px solid ${borderColor}`,
        }}
      >
        <Shield size={22} strokeWidth={1.5} style={{ color: primaryText }} />
      </div>

      <h2
        className="text-lg font-bold mb-1"
        style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: primaryText }}
      >
        {hasSalt ? 'Enter Encryption Password' : 'Set Up Encryption'}
      </h2>
      <p
        className="text-xs mb-6 text-center max-w-[280px]"
        style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: secondaryText }}
      >
        {hasSalt
          ? 'Enter your encryption password to decrypt your notes'
          : 'Create a password to encrypt your notes. This is separate from your login.'}
      </p>

      <div className="w-full max-w-[280px] relative mb-3">
        <input
          type={showPassword ? 'text' : 'password'}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && (hasSalt || confirmPassword) && handleSetup()}
          placeholder="Encryption password"
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

      {!hasSalt && (
        <div className="w-full max-w-[280px] relative mb-3">
          <input
            type={showPassword ? 'text' : 'password'}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSetup()}
            placeholder="Confirm password"
            className="w-full px-4 py-3 rounded-xl text-sm outline-none"
            style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              backgroundColor: inputBg,
              border: `1.5px solid ${error ? '#C45C6A' : borderColor}`,
              color: primaryText,
            }}
          />
        </div>
      )}

      {error && (
        <p
          className="text-xs mb-3"
          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: '#C45C6A' }}
        >
          {error}
        </p>
      )}

      <button
        onClick={handleSetup}
        disabled={loading || !password.trim() || (!hasSalt && !confirmPassword.trim())}
        className="w-full max-w-[280px] py-3 rounded-xl text-sm font-bold transition-all mb-4"
        style={{
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          backgroundColor: password.trim() ? primaryText : inputBg,
          color: password.trim() ? bgColor : tertiaryText,
          border: 'none',
          cursor: password.trim() ? 'pointer' : 'default',
          opacity: loading ? 0.6 : 1,
        }}
      >
        {loading ? 'Setting up...' : (hasSalt ? 'Unlock' : 'Set Up Encryption')}
      </button>
    </div>
  );
}
