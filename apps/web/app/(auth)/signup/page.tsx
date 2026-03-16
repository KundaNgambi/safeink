'use client';

import { useState } from 'react';
import Logo from '@/components/common/Logo';

export default function SignupPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
    setLoading(true);
    setError('');

    setTimeout(() => {
      window.location.href = '/mfa';
      setLoading(false);
    }, 1000);
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6 py-10"
      style={{ backgroundColor: '#0f1117' }}
    >
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <Logo size={56} showWordmark showTagline />
        </div>

        <h2
          className="text-xl font-[800] text-center mb-6"
          style={{ fontFamily: 'var(--font-bricolage)', color: '#f0f1f4' }}
        >
          Create your account
        </h2>

        <form onSubmit={handleSignup} className="space-y-4">
          <InputField label="Full Name" type="text" value={fullName} onChange={setFullName} placeholder="John Doe" />
          <InputField label="Email" type="email" value={email} onChange={setEmail} placeholder="your@email.com" />
          <InputField label="Password" type="password" value={password} onChange={setPassword} placeholder="Min 12 characters" />

          {/* Password strength */}
          {password && (
            <div className="flex flex-wrap gap-2">
              {passwordChecks.map((check) => (
                <span
                  key={check.label}
                  className="text-[10px] px-2 py-1 rounded-md font-semibold"
                  style={{
                    backgroundColor: check.pass ? '#BEFF4620' : '#FF6B6B20',
                    color: check.pass ? '#BEFF46' : '#FF6B6B',
                    fontFamily: 'var(--font-manrope)',
                  }}
                >
                  {check.pass ? '✓' : '✕'} {check.label}
                </span>
              ))}
            </div>
          )}

          <InputField label="Confirm Password" type="password" value={confirmPassword} onChange={setConfirmPassword} placeholder="Re-enter password" />

          {password && confirmPassword && password !== confirmPassword && (
            <p className="text-[10px]" style={{ color: '#FF6B6B', fontFamily: 'var(--font-manrope)' }}>
              Passwords do not match
            </p>
          )}

          {error && (
            <p className="text-xs text-center" style={{ color: '#FF6B6B', fontFamily: 'var(--font-manrope)' }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={!allValid || loading}
            className="w-full py-3.5 rounded-2xl text-sm font-bold transition-all hover:scale-[1.02] active:scale-[0.98]"
            style={{
              background: allValid ? 'linear-gradient(135deg, #BEFF46, #9BD42A)' : 'rgba(190,255,70,0.2)',
              color: allValid ? '#0f1117' : '#BEFF4666',
              fontFamily: 'var(--font-manrope)',
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-sm mt-6" style={{ color: '#8b8fa3', fontFamily: 'var(--font-manrope)' }}>
          Already have an account?{' '}
          <a href="/login" style={{ color: '#BEFF46' }} className="font-semibold hover:underline">
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
        style={{ fontFamily: 'var(--font-manrope)', color: '#8b8fa3' }}
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
          border: '1px solid rgba(255,255,255,0.1)',
          color: '#f0f1f4',
          fontFamily: 'var(--font-manrope)',
        }}
      />
    </div>
  );
}
