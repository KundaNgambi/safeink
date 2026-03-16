'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Check, X } from 'lucide-react';
import Logo from '@/components/common/Logo';
import { createClient } from '@/lib/supabase/client';
import { setupEncryptionOnLogin } from '@/lib/services/encryption';

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const passwordChecks = [
    { label: '12+ characters', pass: password.length >= 12 },
    { label: 'Uppercase letter', pass: /[A-Z]/.test(password) },
    { label: 'Lowercase letter', pass: /[a-z]/.test(password) },
    { label: 'Number', pass: /[0-9]/.test(password) },
    { label: 'Special character', pass: /[^A-Za-z0-9]/.test(password) },
  ];

  const allValid = passwordChecks.every((c) => c.pass) && password === confirmPassword;

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!allValid) return;

    setLoading(true);
    setError('');

    try {
      const supabase = createClient();
      const { error: updateError } = await supabase.auth.updateUser({
        password,
      });

      if (updateError) {
        setError(updateError.message);
        return;
      }

      // Re-derive encryption key with the new password
      // The salt stays the same, so existing notes remain decryptable
      await setupEncryptionOnLogin(password);

      router.push('/');
    } catch {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6 py-10"
      style={{ backgroundColor: '#1B263B' }}
    >
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <Logo size={72} />
          <h1
            className="text-xl font-bold mt-6 mb-2"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: '#E0E1DD' }}
          >
            Set New Password
          </h1>
          <p
            className="text-sm text-center"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: 'rgba(224,225,221,0.6)' }}
          >
            Choose a strong password for your account and encryption.
          </p>
        </div>

        <form onSubmit={handleReset} className="space-y-4">
          <div>
            <label
              className="block text-xs font-semibold mb-2 uppercase tracking-wider"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: 'rgba(224,225,221,0.6)' }}
            >
              New Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min 12 characters"
                className="w-full px-4 py-3 pr-12 rounded-xl text-sm bg-transparent outline-none transition-all"
                style={{
                  border: '1px solid rgba(224,225,221,0.12)',
                  color: '#E0E1DD',
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                }}
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md transition-colors hover:bg-white/5"
                style={{ color: 'rgba(224,225,221,0.6)' }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {password && (
            <div className="flex flex-wrap gap-2">
              {passwordChecks.map((check) => (
                <span
                  key={check.label}
                  className="text-[10px] px-2 py-1 rounded-md font-semibold inline-flex items-center gap-1"
                  style={{
                    backgroundColor: check.pass ? 'rgba(224,225,221,0.1)' : 'rgba(196,92,106,0.1)',
                    color: check.pass ? '#E0E1DD' : '#C45C6A',
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                  }}
                >
                  {check.pass ? <Check size={10} /> : <X size={10} />} {check.label}
                </span>
              ))}
            </div>
          )}

          <div>
            <label
              className="block text-xs font-semibold mb-2 uppercase tracking-wider"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: 'rgba(224,225,221,0.6)' }}
            >
              Confirm Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter password"
                className="w-full px-4 py-3 rounded-xl text-sm bg-transparent outline-none transition-all"
                style={{
                  border: '1px solid rgba(224,225,221,0.12)',
                  color: '#E0E1DD',
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                }}
              />
            </div>
          </div>

          {password && confirmPassword && password !== confirmPassword && (
            <p className="text-[10px]" style={{ color: '#C45C6A', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              Passwords do not match
            </p>
          )}

          {error && (
            <p className="text-xs text-center" style={{ color: '#C45C6A', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={!allValid || loading}
            className="w-full py-3.5 rounded-2xl text-sm transition-all hover:scale-[1.02] active:scale-[0.98]"
            style={{
              backgroundColor: allValid ? '#E0E1DD' : 'rgba(224,225,221,0.2)',
              color: allValid ? '#1B263B' : 'rgba(224,225,221,0.35)',
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontWeight: 600,
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  );
}
