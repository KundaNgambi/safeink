'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Check, X } from 'lucide-react';
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
      style={{ backgroundColor: '#1B263B' }}
    >
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
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

        <h2
          className="text-xl font-bold text-center mb-6"
          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: '#E0E1DD' }}
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

          <PasswordField label="Confirm Password" value={confirmPassword} onChange={setConfirmPassword} placeholder="Re-enter password" />

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

          {success && (
            <p className="text-xs text-center" style={{ color: '#E0E1DD', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              {success}
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
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-sm mt-6" style={{ color: 'rgba(224,225,221,0.6)', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          Already have an account?{' '}
          <a href="/login" style={{ color: '#E0E1DD' }} className="font-semibold hover:underline">
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
        style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: 'rgba(224,225,221,0.6)' }}
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
          border: '1px solid rgba(224,225,221,0.12)',
          color: '#E0E1DD',
          fontFamily: "'Plus Jakarta Sans', sans-serif",
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
        style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: 'rgba(224,225,221,0.6)' }}
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
            border: '1px solid rgba(224,225,221,0.12)',
            color: '#E0E1DD',
            fontFamily: "'Plus Jakarta Sans', sans-serif",
          }}
        />
        <button
          type="button"
          onClick={() => setVisible(!visible)}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md transition-colors hover:bg-white/5"
          style={{ color: 'rgba(224,225,221,0.6)' }}
          aria-label={visible ? 'Hide password' : 'Show password'}
        >
          {visible ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
    </div>
  );
}
