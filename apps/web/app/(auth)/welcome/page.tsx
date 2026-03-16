'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Logo from '@/components/common/Logo';
import { useAppStore } from '@/store';
import {
  Lock, Check, Shield, LayoutGrid, Copy, Moon, Sun,
} from 'lucide-react';

const features = [
  { icon: Lock, label: 'End-to-end encrypted' },
  { icon: Check, label: 'Cross-platform sync' },
  { icon: Shield, label: 'Zero-knowledge' },
  { icon: LayoutGrid, label: 'Smart categories' },
  { icon: Copy, label: 'Easy copy & paste' },
  { icon: Moon, label: 'Dark & light mode' },
];

export default function WelcomePage() {
  const router = useRouter();
  const { theme, toggleTheme } = useAppStore();
  const isDark = theme === 'dark';

  // Allow scrolling on the landing page (body has overflow:hidden by default)
  useEffect(() => {
    document.body.style.overflow = 'auto';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const tx = isDark ? '#E0E1DD' : '#1B263B';
  const ts = isDark ? 'rgba(224,225,221,0.6)' : 'rgba(27,38,59,0.6)';
  const tt = isDark ? 'rgba(224,225,221,0.35)' : 'rgba(27,38,59,0.35)';
  const bg = isDark ? '#1B263B' : '#E0E1DD';
  const bgCard = isDark ? '#243447' : '#FFFFFF';
  const brd = isDark ? 'rgba(224,225,221,0.12)' : 'rgba(27,38,59,0.12)';
  const cb = isDark ? 'rgba(224,225,221,0.1)' : 'rgba(27,38,59,0.1)';
  const opp = isDark ? '#E0E1DD' : '#1B263B';
  const oppFg = isDark ? '#1B263B' : '#E0E1DD';
  const ic = isDark ? '#E0E1DD' : '#1B263B';

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        backgroundColor: bg,
        overflow: 'auto',
        scrollbarWidth: 'none',
        msOverflowStyle: 'none',
      }}
    >
      {/* Nav bar */}
      <nav
        className="flex items-center justify-between px-6 py-4"
        style={{ borderBottom: `1px solid ${brd}` }}
      >
        <div className="flex items-center gap-2.5">
          <Logo size={28} />
          <span
            className="font-bold"
            style={{
              fontSize: 16,
              fontWeight: 700,
              color: tx,
              fontFamily: "'Plus Jakarta Sans', sans-serif",
            }}
          >
            Obscura
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={toggleTheme}
            className="flex items-center justify-center p-1"
            style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}
          >
            {isDark ? (
              <Sun size={16} strokeWidth={1.5} style={{ color: ic }} />
            ) : (
              <Moon size={16} strokeWidth={1.5} style={{ color: ic }} />
            )}
          </button>
          <button
            onClick={() => router.push('/login')}
            className="transition-opacity hover:opacity-90"
            style={{
              background: opp,
              border: 'none',
              borderRadius: 8,
              padding: '8px 16px',
              cursor: 'pointer',
            }}
          >
            <span
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: oppFg,
                fontFamily: "'Plus Jakarta Sans', sans-serif",
              }}
            >
              Open App
            </span>
          </button>
        </div>
      </nav>

      {/* Hero section */}
      <div
        className="flex-1 flex flex-col items-center justify-center text-center"
        style={{ padding: '40px 24px' }}
      >
        <div
          style={{
            animation: 'spin 20s linear infinite',
            marginBottom: 32,
          }}
        >
          <Logo size={72} />
        </div>
        <h1
          style={{
            fontSize: 28,
            fontWeight: 700,
            color: tx,
            margin: '0 0 8px',
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            lineHeight: 1.2,
            letterSpacing: '-0.5px',
          }}
        >
          Your notes.
          <br />
          Hidden by design.
        </h1>
        <p
          style={{
            fontSize: 13,
            color: ts,
            margin: '0 0 28px',
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            maxWidth: 300,
            lineHeight: 1.6,
          }}
        >
          End-to-end encrypted notes that sync across every device.
          Zero-knowledge architecture means only you can read your data.
        </p>
        <div className="flex gap-2.5">
          <button
            onClick={() => router.push('/signup')}
            className="transition-opacity hover:opacity-90 active:scale-[0.98]"
            style={{
              background: opp,
              border: 'none',
              borderRadius: 10,
              padding: '12px 24px',
              cursor: 'pointer',
            }}
          >
            <span
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: oppFg,
                fontFamily: "'Plus Jakarta Sans', sans-serif",
              }}
            >
              Get Started
            </span>
          </button>
          <button
            className="transition-opacity hover:opacity-80"
            style={{
              background: 'transparent',
              border: `1.5px solid ${brd}`,
              borderRadius: 10,
              padding: '12px 24px',
              cursor: 'pointer',
            }}
          >
            <span
              style={{
                fontSize: 13,
                fontWeight: 500,
                color: ts,
                fontFamily: "'Plus Jakarta Sans', sans-serif",
              }}
            >
              Learn More
            </span>
          </button>
        </div>
      </div>

      {/* Features grid */}
      <div className="px-6 pb-8">
        <div className="grid grid-cols-2 gap-2.5 max-w-md mx-auto">
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <div
                key={i}
                className="flex items-center gap-2.5"
                style={{
                  padding: '14px 16px',
                  background: bgCard,
                  borderRadius: 12,
                  border: `1px solid ${cb}`,
                }}
              >
                <Icon
                  size={18}
                  strokeWidth={1.5}
                  className="flex-shrink-0"
                  style={{ color: ic }}
                />
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 500,
                    color: tx,
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                  }}
                >
                  {f.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* CTA section */}
      <div
        className="flex flex-col items-center text-center py-10 px-6"
        style={{ borderTop: `1px solid ${brd}` }}
      >
        <h2
          style={{
            fontSize: 20,
            fontWeight: 700,
            color: tx,
            margin: '0 0 12px',
            fontFamily: "'Plus Jakarta Sans', sans-serif",
          }}
        >
          Start writing. Stay hidden.
        </h2>
        <button
          onClick={() => router.push('/signup')}
          className="transition-opacity hover:opacity-90 active:scale-[0.98]"
          style={{
            background: opp,
            border: 'none',
            borderRadius: 10,
            padding: '12px 28px',
            cursor: 'pointer',
          }}
        >
          <span
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: oppFg,
              fontFamily: "'Plus Jakarta Sans', sans-serif",
            }}
          >
            Get Started
          </span>
        </button>
      </div>

      {/* Footer */}
      <footer
        className="flex items-center justify-between px-6 py-4"
        style={{ borderTop: `1px solid ${brd}` }}
      >
        <div className="flex items-center gap-2">
          <Logo size={16} />
          <span
            style={{
              fontSize: 11,
              color: tt,
              fontFamily: "'Plus Jakarta Sans', sans-serif",
            }}
          >
            Obscura · Hidden by design
          </span>
        </div>
        <span
          style={{
            fontSize: 10,
            color: tt,
            fontFamily: "'JetBrains Mono', monospace",
          }}
        >
          v3.0
        </span>
      </footer>
    </div>
  );
}
