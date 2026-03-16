'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Logo from '@/components/common/Logo';
import { useAuthStore } from '@/store/auth';
import { signinSchema } from '@safeink/shared';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
        router.push('/mfa');
        return;
      }

      router.push('/');
    } catch {
      setError('An unexpected error occurred');
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
      style={{ backgroundColor: '#0f1117' }}
    >
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-10">
          <Logo size={72} showWordmark={false} />
          <div className="mt-4 text-center">
            <h1
              className="text-3xl font-[800]"
              style={{ fontFamily: 'var(--font-bricolage)' }}
            >
              <span style={{ color: '#f0f1f4' }}>safe</span>
              <span style={{ color: '#BEFF46' }}>ink</span>
            </h1>
            <p
              className="text-sm mt-1"
              style={{ fontFamily: 'var(--font-manrope)', color: '#8b8fa3' }}
            >
              Your thoughts, encrypted.
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label
              className="block text-xs font-semibold mb-2 uppercase tracking-wider"
              style={{ fontFamily: 'var(--font-manrope)', color: '#8b8fa3' }}
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
                border: '1px solid rgba(255,255,255,0.1)',
                color: '#f0f1f4',
                fontFamily: 'var(--font-manrope)',
              }}
            />
          </div>

          <div>
            <label
              className="block text-xs font-semibold mb-2 uppercase tracking-wider"
              style={{ fontFamily: 'var(--font-manrope)', color: '#8b8fa3' }}
            >
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full px-4 py-3 rounded-xl text-sm bg-transparent outline-none transition-all"
              style={{
                border: '1px solid rgba(255,255,255,0.1)',
                color: '#f0f1f4',
                fontFamily: 'var(--font-manrope)',
              }}
            />
          </div>

          {error && (
            <p className="text-xs text-center" style={{ color: '#FF6B6B', fontFamily: 'var(--font-manrope)' }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-2xl text-sm font-bold transition-all hover:scale-[1.02] active:scale-[0.98]"
            style={{
              background: 'linear-gradient(135deg, #BEFF46, #9BD42A)',
              color: '#0f1117',
              fontFamily: 'var(--font-manrope)',
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 h-px" style={{ backgroundColor: 'rgba(255,255,255,0.06)' }} />
          <span className="text-xs" style={{ color: '#555a6e', fontFamily: 'var(--font-manrope)' }}>or continue with</span>
          <div className="flex-1 h-px" style={{ backgroundColor: 'rgba(255,255,255,0.06)' }} />
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
                border: '1px solid rgba(255,255,255,0.1)',
                color: '#f0f1f4',
                fontFamily: 'var(--font-manrope)',
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Sign up link */}
        <p className="text-center text-sm mt-8" style={{ color: '#8b8fa3', fontFamily: 'var(--font-manrope)' }}>
          Don&apos;t have an account?{' '}
          <a href="/signup" style={{ color: '#BEFF46' }} className="font-semibold hover:underline">
            Sign Up
          </a>
        </p>
      </div>
    </div>
  );
}
