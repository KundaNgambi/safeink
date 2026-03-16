'use client';

import { useState, useEffect } from 'react';
import { useAppStore } from '@/store';
import { useAuthStore } from '@/store/auth';
import Logo from '@/components/common/Logo';
import {
  User, Moon, Shield, Search, LayoutGrid, ChevronRight,
  Lock, ShieldCheck, ClipboardCopy, Timer,
} from 'lucide-react';

interface SecurityFeature {
  icon: typeof Lock;
  title: string;
  status: string;
  active: boolean;
  weight: number;
}

export default function SettingsScreen() {
  const { theme, toggleTheme, autoLockEnabled, setAutoLockEnabled, autoLockTimeout, setAutoLockTimeout } = useAppStore();
  const { user, signOut, getMfaFactors } = useAuthStore();
  const isDark = theme === 'dark';

  const [mfaEnabled, setMfaEnabled] = useState(false);
  const [mfaChecked, setMfaChecked] = useState(false);

  // Check MFA status dynamically
  useEffect(() => {
    const checkMfa = async () => {
      try {
        const factors = await getMfaFactors();
        const hasVerified = factors.totp.some((f) => f.status === 'verified');
        setMfaEnabled(hasVerified);
      } catch {
        setMfaEnabled(false);
      }
      setMfaChecked(true);
    };
    checkMfa();
  }, [getMfaFactors]);

  const primaryText = isDark ? '#E0E1DD' : '#1B263B';
  const secondaryText = isDark ? 'rgba(224,225,221,0.6)' : 'rgba(27,38,59,0.6)';
  const tertiaryText = isDark ? 'rgba(224,225,221,0.35)' : 'rgba(27,38,59,0.35)';
  const borderColor = isDark ? 'rgba(224,225,221,0.12)' : 'rgba(27,38,59,0.12)';
  const cardBg = isDark ? '#243447' : '#FFFFFF';
  const cardBorder = isDark ? 'rgba(224,225,221,0.1)' : 'rgba(27,38,59,0.1)';
  const activeBg = isDark ? 'rgba(224,225,221,0.1)' : 'rgba(27,38,59,0.08)';
  const inactiveBg = isDark ? 'rgba(196,92,106,0.12)' : 'rgba(196,92,106,0.08)';

  const settingsItems = [
    { icon: Moon, label: 'Appearance', onClick: toggleTheme },
    { icon: Shield, label: 'Security' },
    { icon: Search, label: 'Storage & Sync' },
    { icon: LayoutGrid, label: 'Connected Devices' },
  ];

  // Build security features dynamically based on actual implementation status
  const securityFeatures: SecurityFeature[] = [
    {
      icon: Lock,
      title: 'End-to-End Encryption',
      status: 'Active',
      active: true, // Always active — AES-256-GCM implemented in shared/crypto
      weight: 25,
    },
    {
      icon: ShieldCheck,
      title: 'Two-Factor Auth',
      status: mfaChecked ? (mfaEnabled ? 'Enabled' : 'Not Set Up') : 'Checking...',
      active: mfaEnabled,
      weight: 25,
    },
    {
      icon: Shield,
      title: 'Row-Level Security',
      status: 'Active',
      active: true, // Always active — enforced at database level
      weight: 20,
    },
    {
      icon: ClipboardCopy,
      title: 'Clipboard Protection',
      status: 'Active',
      active: true, // Always active — 30s auto-clear in CopyButton
      weight: 15,
    },
    {
      icon: Timer,
      title: 'Auto-Lock',
      status: autoLockEnabled ? `${autoLockTimeout} min` : 'Disabled',
      active: autoLockEnabled,
      weight: 15,
    },
  ];

  // Calculate score dynamically
  const securityScore = securityFeatures.reduce(
    (score, feat) => score + (feat.active ? feat.weight : 0),
    0
  );

  const scoreLabel =
    securityScore === 100
      ? 'Perfect — All security features active'
      : securityScore >= 75
        ? 'Good — Some features can be improved'
        : 'Needs attention — Enable more features';

  const handleAutoLockToggle = () => {
    setAutoLockEnabled(!autoLockEnabled);
  };

  const cycleAutoLockTimeout = () => {
    const options = [1, 2, 5, 10, 15];
    const currentIndex = options.indexOf(autoLockTimeout);
    const nextIndex = (currentIndex + 1) % options.length;
    setAutoLockTimeout(options[nextIndex]!);
  };

  return (
    <div className="flex flex-col h-full overflow-auto pb-24">
      {/* Header */}
      <div className="px-5 pt-5 pb-4">
        <h1
          className="text-2xl"
          style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontWeight: 700,
            color: primaryText,
          }}
        >
          Settings
        </h1>
      </div>

      {/* Account card */}
      <div className="px-5 mb-5">
        <div
          className="flex items-center gap-3.5 p-4 rounded-2xl"
          style={{
            backgroundColor: cardBg,
            border: `1px solid ${cardBorder}`,
          }}
        >
          <div
            className="flex-shrink-0 flex items-center justify-center"
            style={{
              width: 44,
              height: 44,
              borderRadius: '50%',
              border: `1.5px solid ${borderColor}`,
            }}
          >
            <User size={22} strokeWidth={1.5} style={{ color: primaryText }} />
          </div>
          <div className="flex-1 min-w-0">
            <div
              className="text-[15px] font-semibold truncate"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: primaryText }}
            >
              {user?.user_metadata?.full_name || 'User'}
            </div>
            <div
              className="text-[11px] truncate"
              style={{ fontFamily: "'JetBrains Mono', monospace", color: tertiaryText }}
            >
              {user?.email || 'Not signed in'}
            </div>
          </div>
        </div>
      </div>

      {/* General settings */}
      <div className="px-5 mb-5">
        {settingsItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.label}
              onClick={item.onClick}
              className="flex items-center gap-3 w-full px-4 py-3.5 rounded-xl mb-1.5 text-left transition-colors"
              style={{
                backgroundColor: cardBg,
                border: `1px solid ${cardBorder}`,
                cursor: 'pointer',
              }}
            >
              <Icon size={18} strokeWidth={1.5} style={{ color: primaryText }} />
              <span
                className="flex-1 text-[13px] font-medium"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: primaryText }}
              >
                {item.label}
              </span>
              <ChevronRight size={16} strokeWidth={1.5} style={{ color: tertiaryText }} />
            </button>
          );
        })}
      </div>

      {/* Security section */}
      <div className="px-5 mb-5">
        <div className="mb-3 px-1">
          <span
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: secondaryText,
              letterSpacing: '1.5px',
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              textTransform: 'uppercase',
            }}
          >
            Security
          </span>
        </div>

        {/* Security score */}
        <div
          className="rounded-2xl p-5 mb-4"
          style={{
            backgroundColor: cardBg,
            border: `1px solid ${cardBorder}`,
          }}
        >
          <div className="flex items-baseline gap-1 mb-1">
            <span
              style={{
                fontSize: 40,
                fontWeight: 700,
                color: primaryText,
                fontFamily: "'Plus Jakarta Sans', sans-serif",
              }}
            >
              {securityScore}
            </span>
            <span style={{ fontSize: 14, color: secondaryText }}>/100</span>
          </div>
          <p
            className="text-xs font-medium"
            style={{ color: secondaryText, fontFamily: "'Plus Jakarta Sans', sans-serif", margin: 0 }}
          >
            {scoreLabel}
          </p>
        </div>

        {/* Security features list */}
        {securityFeatures.map((feat) => {
          const Icon = feat.icon;
          const isAutoLock = feat.title === 'Auto-Lock';
          return (
            <div
              key={feat.title}
              className="flex items-center gap-3 px-4 py-3.5 rounded-xl mb-1.5"
              style={{
                backgroundColor: cardBg,
                border: `1px solid ${cardBorder}`,
                cursor: isAutoLock ? 'pointer' : 'default',
              }}
              onClick={isAutoLock ? handleAutoLockToggle : undefined}
            >
              <Icon size={18} strokeWidth={1.5} style={{ color: primaryText, flexShrink: 0 }} />
              <span
                className="flex-1 text-[13px] font-medium"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: primaryText }}
              >
                {feat.title}
              </span>
              {isAutoLock && feat.active && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    cycleAutoLockTimeout();
                  }}
                  className="text-[10px] font-semibold px-2 py-0.5 rounded-md mr-1"
                  style={{
                    backgroundColor: 'transparent',
                    color: secondaryText,
                    border: `1px solid ${borderColor}`,
                    fontFamily: "'JetBrains Mono', monospace",
                    cursor: 'pointer',
                  }}
                >
                  {autoLockTimeout}m
                </button>
              )}
              <span
                className="text-[10px] font-semibold px-2.5 py-1 rounded-md"
                style={{
                  backgroundColor: feat.active ? activeBg : inactiveBg,
                  color: feat.active ? primaryText : '#C45C6A',
                  fontFamily: "'JetBrains Mono', monospace",
                }}
              >
                {feat.status}
              </span>
            </div>
          );
        })}
      </div>

      {/* Sign out */}
      <div className="px-5 mb-5">
        <button
          onClick={() => signOut().then(() => { window.location.href = '/welcome'; })}
          className="w-full py-3.5 rounded-2xl text-sm font-bold transition-all"
          style={{
            border: `1px solid ${borderColor}`,
            color: '#C45C6A',
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            backgroundColor: 'transparent',
            cursor: 'pointer',
          }}
        >
          Sign Out
        </button>
      </div>

      {/* App info */}
      <div className="px-5 pb-8 flex flex-col items-center gap-2">
        <Logo size={32} />
        <p
          className="text-[10px]"
          style={{ fontFamily: "'JetBrains Mono', monospace", color: tertiaryText }}
        >
          Obscura v3.0.0
        </p>
      </div>
    </div>
  );
}
