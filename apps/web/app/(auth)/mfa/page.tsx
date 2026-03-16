'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Logo from '@/components/common/Logo';
import { useAuthStore } from '@/store/auth';

export default function MFAPage() {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [factorId, setFactorId] = useState<string | null>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const router = useRouter();
  const { verifyMfa, getMfaFactors } = useAuthStore();

  useEffect(() => {
    getMfaFactors().then(({ totp }) => {
      const verified = totp.find((f) => f.status === 'verified');
      if (verified) {
        setFactorId(verified.id);
      }
    });
  }, [getMfaFactors]);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newCode = [...code];
    newCode[index] = value.slice(-1);
    setCode(newCode);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const isComplete = code.every((d) => d !== '');

  const handleVerify = async () => {
    if (!isComplete || !factorId) return;
    setLoading(true);
    setError('');

    try {
      const { error: mfaError } = await verifyMfa(factorId, code.join(''));

      if (mfaError) {
        setError('Invalid code. Please try again.');
        setCode(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
        return;
      }

      router.push('/');
    } catch {
      setError('Verification failed');
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
          <Logo size={56} />
          <h1
            className="text-xl font-bold mt-6 mb-2"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: '#E0E1DD' }}
          >
            Two-Factor Authentication
          </h1>
          <p
            className="text-sm text-center"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: 'rgba(224,225,221,0.6)' }}
          >
            Enter the 6-digit code from your authenticator app
          </p>
        </div>

        {/* Code inputs */}
        <div className="flex gap-3 justify-center mb-8">
          {code.map((digit, i) => (
            <input
              key={i}
              ref={(el) => { inputRefs.current[i] = el; }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              className="w-12 h-14 text-center text-xl font-bold rounded-xl bg-transparent outline-none transition-all"
              style={{
                border: `2px solid ${digit ? '#E0E1DD' : 'rgba(224,225,221,0.12)'}`,
                color: '#E0E1DD',
                fontFamily: "'JetBrains Mono', monospace",
                boxShadow: digit ? '0 0 12px rgba(224,225,221,0.15)' : 'none',
              }}
              autoFocus={i === 0}
            />
          ))}
        </div>

        {error && (
          <p className="text-xs text-center mb-4" style={{ color: '#C45C6A', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            {error}
          </p>
        )}

        <button
          onClick={handleVerify}
          disabled={!isComplete || loading || !factorId}
          className="w-full py-3.5 rounded-2xl text-sm transition-all hover:scale-[1.02] active:scale-[0.98]"
          style={{
            backgroundColor: isComplete ? '#E0E1DD' : 'rgba(224,225,221,0.2)',
            color: isComplete ? '#1B263B' : 'rgba(224,225,221,0.35)',
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontWeight: 600,
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? 'Verifying...' : 'Verify'}
        </button>

        <p
          className="text-center text-xs mt-6"
          style={{ color: 'rgba(224,225,221,0.35)', fontFamily: "'Plus Jakarta Sans', sans-serif" }}
        >
          Didn&apos;t receive a code?{' '}
          <button style={{ color: '#E0E1DD' }} className="font-semibold hover:underline">
            Resend
          </button>
        </p>
      </div>
    </div>
  );
}
