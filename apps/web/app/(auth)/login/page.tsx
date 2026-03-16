'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff } from 'lucide-react';
import Logo from '@/components/common/Logo';
import { useAuthStore } from '@/store/auth';
import { signinSchema } from '@safeink/shared';
import { setupEncryptionOnLogin } from '@/lib/services/encryption';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const { signIn, signInWithOAuth } = useAuthStore();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const validation = signinSchema.safeParse({ email, password });
    if (!validation.success) {
      setError(validation.error.issues[0].message);
      return;
    }

    setLoading(true);
    try {
      const { error: authError, mfaRequired } = await signIn(email, password);

      if (authError) {
        setError(authError.message === 'Invalid login credentials'
          ? 'Invalid email or password'
          : authError.message);
        return;
      }

      if (mfaRequired) {
        // Store password temporarily for key derivation after MFA
        sessionStorage.setItem('obscura_pending_pw', password);
        router.push('/mfa');
        return;
      }

      // Derive encryption key from password
      await setupEncryptionOnLogin(password);
      router.push('/');
    } catch (err) {
      console.error('Login error:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOAuth = async (provider: 'google' | 'apple' | 'azure') => {
    const { error: authError } = await signInWithOAuth(provider);
    if (authError) {
      setError(authError.message);
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6"
      style={{ backgroundColor: '#1B263B' }}
    >
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-10">
          <Logo size={72} />
          <div className="mt-4 text-center">
            <h1
              className="font-bold"
              style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontSize: 28,
                fontWeight: 700,
                color: '#E0E1DD',
              }}
            >
              Obscura
            </h1>
            <p
              className="mt-1"
              style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontSize: 13,
                color: 'rgba(224,225,221,0.6)',
              }}
            >
              Hidden by design.
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label
              className="block text-xs font-semibold mb-2 uppercase tracking-wider"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: 'rgba(224,225,221,0.6)' }}
            >
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="w-full px-4 py-3 rounded-xl text-sm bg-transparent outline-none transition-all focus:ring-2"
              style={{
                border: '1px solid rgba(224,225,221,0.12)',
                color: '#E0E1DD',
                fontFamily: "'Plus Jakarta Sans', sans-serif",
              }}
            />
          </div>

          <div>
            <label
              className="block text-xs font-semibold mb-2 uppercase tracking-wider"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: 'rgba(224,225,221,0.6)' }}
            >
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full px-4 py-3 pr-12 rounded-xl text-sm bg-transparent outline-none transition-all"
                style={{
                  border: '1px solid rgba(224,225,221,0.12)',
                  color: '#E0E1DD',
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md transition-colors hover:bg-white/5"
                style={{ color: 'rgba(224,225,221,0.6)' }}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="flex justify-end">
            <a
              href="/forgot-password"
              className="text-xs font-medium hover:underline"
              style={{ color: 'rgba(224,225,221,0.6)', fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              Forgot password?
            </a>
          </div>

          {error && (
            <p className="text-xs text-center" style={{ color: '#C45C6A', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-2xl text-sm transition-all hover:scale-[1.02] active:scale-[0.98]"
            style={{
              backgroundColor: '#E0E1DD',
              color: '#1B263B',
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontWeight: 600,
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 h-px" style={{ backgroundColor: 'rgba(224,225,221,0.12)' }} />
          <span className="text-xs" style={{ color: 'rgba(224,225,221,0.35)', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>or continue with</span>
          <div className="flex-1 h-px" style={{ backgroundColor: 'rgba(224,225,221,0.12)' }} />
        </div>

        {/* OAuth */}
        <div className="flex gap-3">
          {([
            { label: 'Google', provider: 'google' as const },
            { label: 'Apple', provider: 'apple' as const },
            { label: 'Microsoft', provider: 'azure' as const },
          ]).map(({ label, provider }) => (
            <button
              key={label}
              onClick={() => handleOAuth(provider)}
              className="flex-1 py-3 rounded-xl text-xs font-semibold transition-all hover:bg-white/5"
              style={{
                border: '1px solid rgba(224,225,221,0.12)',
                color: '#E0E1DD',
                fontFamily: "'Plus Jakarta Sans', sans-serif",
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Sign up link */}
        <p className="text-center text-sm mt-8" style={{ color: 'rgba(224,225,221,0.6)', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          Don&apos;t have an account?{' '}
          <a href="/signup" style={{ color: '#E0E1DD' }} className="font-semibold hover:underline">
            Sign Up
          </a>
        </p>
      </div>
    </div>
  );
}
