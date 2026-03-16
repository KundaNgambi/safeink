'use client';

import { useState } from 'react';
import Logo from '@/components/common/Logo';
import { createClient } from '@/lib/supabase/client';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    setError('');

    try {
      const supabase = createClient();
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
      });

      if (resetError) {
        setError(resetError.message);
      } else {
        setSent(true);
      }
    } catch {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6"
      style={{ backgroundColor: '#1B263B' }}
    >
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-10">
          <Logo size={72} />
          <h1
            className="text-xl font-bold mt-6 mb-2"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: '#E0E1DD' }}
          >
            Reset Password
          </h1>
          <p
            className="text-sm text-center"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: 'rgba(224,225,221,0.6)' }}
          >
            {sent
              ? 'Check your email for a password reset link.'
              : "Enter your email and we'll send you a reset link."}
          </p>
        </div>

        {!sent ? (
          <form onSubmit={handleSubmit} className="space-y-4">
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
                className="w-full px-4 py-3 rounded-xl text-sm bg-transparent outline-none transition-all"
                style={{
                  border: '1px solid rgba(224,225,221,0.12)',
                  color: '#E0E1DD',
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                }}
                autoFocus
              />
            </div>

            {error && (
              <p className="text-xs text-center" style={{ color: '#C45C6A', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading || !email.trim()}
              className="w-full py-3.5 rounded-2xl text-sm transition-all hover:scale-[1.02] active:scale-[0.98]"
              style={{
                backgroundColor: email.trim() ? '#E0E1DD' : 'rgba(224,225,221,0.2)',
                color: email.trim() ? '#1B263B' : 'rgba(224,225,221,0.35)',
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontWeight: 600,
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>
        ) : (
          <div className="text-center">
            <div
              className="w-16 h-16 mx-auto mb-4 flex items-center justify-center rounded-full"
              style={{ border: '2px solid rgba(224,225,221,0.2)' }}
            >
              <span style={{ fontSize: 28 }}>✓</span>
            </div>
            <p
              className="text-sm mb-6"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: 'rgba(224,225,221,0.6)' }}
            >
              If an account exists with that email, you will receive a reset link shortly.
            </p>
          </div>
        )}

        <p className="text-center text-sm mt-8" style={{ color: 'rgba(224,225,221,0.6)', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          Remember your password?{' '}
          <a href="/login" style={{ color: '#E0E1DD' }} className="font-semibold hover:underline">
            Sign In
          </a>
        </p>
      </div>
    </div>
  );
}
