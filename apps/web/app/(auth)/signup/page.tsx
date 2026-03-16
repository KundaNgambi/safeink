'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Logo from '@/components/common/Logo';
import { useAuthStore } from '@/store/auth';
import { signupSchema } from '@safeink/shared';

export default function SignupPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();
  const { signUp } = useAuthStore();

  const passwordChecks = [
    { label: '12+ characters', pass: password.length >= 12 },
    { label: 'Uppercase letter', pass: /[A-Z]/.test(password) },
    { label: 'Lowercase letter', pass: /[a-z]/.test(password) },
    { label: 'Number', pass: /[0-9]/.test(password) },
    { label: 'Special character', pass: /[^A-Za-z0-9]/.test(password) },
  ];

  const allValid = passwordChecks.every((c) => c.pass) && password === confirmPassword && email && fullName;

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!allValid) return;
    setError('');
    setSuccess('');

    const validation = signupSchema.safeParse({ email, password, confirmPassword, fullName });
    if (!validation.success) {
      setError(validation.error.issues[0].message);
      return;
    }

    setLoading(true);
    try {
      const { error: authError, needsEmailConfirmation } = await signUp(email, password, fullName);

      if (authError) {
        setError(authError.message);
        return;
      }

      if (needsEmailConfirmation) {
        setSuccess('Check your email for a confirmation link.');
        return;
      }

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
      style={{ backgroundColor: '#0D1B2A' }}
    >
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <Logo size={56} showWordmark showTagline />
        </div>

        <h2
          className="text-xl font-[800] text-center mb-6"
          style={{ fontFamily: 'var(--font-bricolage)', color: '#E0E1DD' }}
        >
          Create your account
        </h2>

        <form onSubmit={handleSignup} className="space-y-4">
          <InputField label="Full Name" type="text" value={fullName} onChange={setFullName} placeholder="John Doe" />
          <InputField label="Email" type="email" value={email} onChange={setEmail} placeholder="your@email.com" />
          <PasswordField label="Password" value={password} onChange={setPassword} placeholder="Min 12 characters" />

          {/* Password strength */}
          {password && (
            <div className="flex flex-wrap gap-2">
              {passwordChecks.map((check) => (
                <span
                  key={check.label}
                  className="text-[10px] px-2 py-1 rounded-md font-semibold"
                  style={{
                    backgroundColor: check.pass ? '#F4A26120' : '#E07A8E20',
                    color: check.pass ? '#F4A261' : '#E07A8E',
                    fontFamily: 'var(--font-manrope)',
                  }}
                >
                  {check.pass ? '✓' : '✕'} {check.label}
                </span>
              ))}
            </div>
          )}

          <PasswordField label="Confirm Password" value={confirmPassword} onChange={setConfirmPassword} placeholder="Re-enter password" />

          {password && confirmPassword && password !== confirmPassword && (
            <p className="text-[10px]" style={{ color: '#E07A8E', fontFamily: 'var(--font-manrope)' }}>
              Passwords do not match
            </p>
          )}

          {error && (
            <p className="text-xs text-center" style={{ color: '#E07A8E', fontFamily: 'var(--font-manrope)' }}>
              {error}
            </p>
          )}

          {success && (
            <p className="text-xs text-center" style={{ color: '#F4A261', fontFamily: 'var(--font-manrope)' }}>
              {success}
            </p>
          )}

          <button
            type="submit"
            disabled={!allValid || loading}
            className="w-full py-3.5 rounded-2xl text-sm font-bold transition-all hover:scale-[1.02] active:scale-[0.98]"
            style={{
              background: allValid ? 'linear-gradient(135deg, #F4A261, #E09049)' : 'rgba(244,162,97,0.2)',
              color: allValid ? '#0D1B2A' : '#F4A26166',
              fontFamily: 'var(--font-manrope)',
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-sm mt-6" style={{ color: '#778DA9', fontFamily: 'var(--font-manrope)' }}>
          Already have an account?{' '}
          <a href="/login" style={{ color: '#F4A261' }} className="font-semibold hover:underline">
            Sign In
          </a>
        </p>
      </div>
    </div>
  );
}

function InputField({
  label, type, value, onChange, placeholder,
}: {
  label: string; type: string; value: string; onChange: (v: string) => void; placeholder: string;
}) {
  return (
    <div>
      <label
        className="block text-xs font-semibold mb-2 uppercase tracking-wider"
        style={{ fontFamily: 'var(--font-manrope)', color: '#778DA9' }}
      >
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-3 rounded-xl text-sm bg-transparent outline-none transition-all"
        style={{
          border: '1px solid rgba(119,141,169,0.2)',
          color: '#E0E1DD',
          fontFamily: 'var(--font-manrope)',
        }}
      />
    </div>
  );
}

function PasswordField({
  label, value, onChange, placeholder,
}: {
  label: string; value: string; onChange: (v: string) => void; placeholder: string;
}) {
  const [visible, setVisible] = useState(false);

  return (
    <div>
      <label
        className="block text-xs font-semibold mb-2 uppercase tracking-wider"
        style={{ fontFamily: 'var(--font-manrope)', color: '#778DA9' }}
      >
        {label}
      </label>
      <div className="relative">
        <input
          type={visible ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full px-4 py-3 pr-12 rounded-xl text-sm bg-transparent outline-none transition-all"
          style={{
            border: '1px solid rgba(119,141,169,0.2)',
            color: '#E0E1DD',
            fontFamily: 'var(--font-manrope)',
          }}
        />
        <button
          type="button"
          onClick={() => setVisible(!visible)}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md transition-colors hover:bg-white/5"
          style={{ color: '#778DA9', fontSize: 14 }}
          aria-label={visible ? 'Hide password' : 'Show password'}
        >
          {visible ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
              <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
              <line x1="1" y1="1" x2="23" y2="23" />
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}
