'use client';

import { useState } from 'react';
import Logo from '@/components/common/Logo';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }
    setLoading(true);
    setError('');

    // Demo: redirect to app
    setTimeout(() => {
      window.location.href = '/';
      setLoading(false);
    }, 1000);
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
          {['Google', 'Apple', 'Microsoft'].map((provider) => (
            <button
              key={provider}
              className="flex-1 py-3 rounded-xl text-xs font-semibold transition-all hover:bg-white/5"
              style={{
                border: '1px solid rgba(255,255,255,0.1)',
                color: '#f0f1f4',
                fontFamily: 'var(--font-manrope)',
              }}
            >
              {provider}
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
