'use client';

import { useAppStore } from '@/store';
import { useAuthStore } from '@/store/auth';
import Logo from '@/components/common/Logo';
import { User, Moon, Shield, Search, LayoutGrid, ChevronRight, Lock, Fingerprint, ClipboardCopy, TimerReset } from 'lucide-react';

export default function SettingsScreen() {
  const { theme, toggleTheme } = useAppStore();
  const { user, signOut } = useAuthStore();
  const isDark = theme === 'dark';

  const primaryText = isDark ? '#E0E1DD' : '#1B263B';
  const secondaryText = isDark ? 'rgba(224,225,221,0.6)' : 'rgba(27,38,59,0.6)';
  const tertiaryText = isDark ? 'rgba(224,225,221,0.35)' : 'rgba(27,38,59,0.35)';
  const borderColor = isDark ? 'rgba(224,225,221,0.12)' : 'rgba(27,38,59,0.12)';
  const cardBg = isDark ? '#243447' : '#FFFFFF';
  const cardBorder = isDark ? 'rgba(224,225,221,0.1)' : 'rgba(27,38,59,0.1)';

  const securityScore = 67;

  const settingsItems = [
    { icon: Moon, label: 'Theme', value: isDark ? 'Dark' : 'Light', onClick: toggleTheme },
    { icon: Shield, label: 'Security', value: 'Manage' },
    { icon: Search, label: 'Search', value: 'Enabled' },
    { icon: LayoutGrid, label: 'Layout', value: 'Grid' },
  ];

  const securityFeatures = [
    { icon: Lock, title: 'End-to-End Encryption', status: 'Active', active: true },
    { icon: Shield, title: 'Two-Factor Authentication', status: 'Not Enabled', active: false },
    { icon: Shield, title: 'Row-Level Security', status: 'Active', active: true },
    { icon: Fingerprint, title: 'Biometric Unlock', status: 'Not Available', active: false },
    { icon: ClipboardCopy, title: 'Clipboard Protection', status: 'Not Available', active: false },
    { icon: TimerReset, title: 'Auto-Lock', status: 'Not Available', active: false },
  ];

  return (
    <div className="flex flex-col h-full overflow-auto pb-24">
      {/* Header */}
      <div className="px-5 pt-5 pb-4">
        <h1
          className="text-2xl font-[800]"
          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: primaryText }}
        >
          Settings
        </h1>
      </div>

      {/* Account card */}
      <div className="px-5 mb-5">
        <div
          className="flex items-center gap-4 p-5 rounded-2xl"
          style={{
            backgroundColor: cardBg,
            border: `1px solid ${cardBorder}`,
          }}
        >
          {/* Avatar with User icon */}
          <div
            className="flex-shrink-0 flex items-center justify-center"
            style={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              border: `2px solid ${borderColor}`,
            }}
          >
            <User size={24} style={{ color: primaryText }} />
          </div>
          <div className="flex-1 min-w-0">
            <h2
              className="text-base font-bold truncate"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: primaryText }}
            >
              {user?.user_metadata?.full_name || 'User'}
            </h2>
            <p
              className="text-xs truncate"
              style={{ fontFamily: "'JetBrains Mono', monospace", color: secondaryText }}
            >
              {user?.email || 'Not signed in'}
            </p>
          </div>
          <ChevronRight size={18} style={{ color: tertiaryText }} />
        </div>
      </div>

      {/* General settings */}
      <div className="px-5 mb-5">
        <h3
          className="font-body font-bold uppercase mb-3 px-1"
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: secondaryText,
            letterSpacing: '1.5px',
            fontFamily: "'Plus Jakarta Sans', sans-serif",
          }}
        >
          GENERAL
        </h3>
        <div
          className="rounded-2xl overflow-hidden"
          style={{
            backgroundColor: cardBg,
            border: `1px solid ${cardBorder}`,
          }}
        >
          {settingsItems.map((item, i) => {
            const Icon = item.icon;
            return (
              <button
                key={item.label}
                onClick={item.onClick}
                className="flex items-center gap-3 w-full px-4 py-3.5 text-left transition-colors"
                style={{
                  borderBottom: i < settingsItems.length - 1
                    ? `1px solid ${borderColor}`
                    : 'none',
                }}
              >
                <Icon size={18} style={{ color: primaryText }} />
                <span
                  className="flex-1 text-sm font-body font-medium"
                  style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: primaryText }}
                >
                  {item.label}
                </span>
                <span
                  className="text-xs font-body"
                  style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: secondaryText }}
                >
                  {item.value}
                </span>
                <ChevronRight size={14} style={{ color: tertiaryText }} />
              </button>
            );
          })}
        </div>
      </div>

      {/* Security section */}
      <div className="px-5 mb-5">
        <h3
          className="font-body font-bold uppercase mb-3 px-1 flex items-center gap-1.5"
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: secondaryText,
            letterSpacing: '1.5px',
            fontFamily: "'Plus Jakarta Sans', sans-serif",
          }}
        >
          <Shield size={12} style={{ color: secondaryText }} />
          SECURITY
        </h3>

        {/* Security score */}
        <div
          className="rounded-2xl p-5 mb-3"
          style={{
            backgroundColor: cardBg,
            border: `1px solid ${cardBorder}`,
          }}
        >
          <p
            className="text-xs font-body font-semibold mb-1"
            style={{ color: secondaryText, fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            Security Score
          </p>
          <p
            className="text-4xl font-display font-[800]"
            style={{ color: primaryText, fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            {securityScore}<span style={{ color: secondaryText, fontSize: '1rem' }}>/100</span>
          </p>
          <p
            className="text-[10px] font-body mt-1"
            style={{ color: secondaryText, fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            {securityScore >= 80 ? 'Excellent' : securityScore >= 50 ? 'Good' : 'Needs Improvement'} — {securityScore >= 80 ? 'Core security features active' : 'Enable more security features'}
          </p>
        </div>

        {/* Security features */}
        <div
          className="rounded-2xl overflow-hidden"
          style={{
            backgroundColor: cardBg,
            border: `1px solid ${cardBorder}`,
          }}
        >
          {securityFeatures.map((feat, i) => {
            const Icon = feat.icon;
            return (
              <div
                key={feat.title}
                className="flex items-center gap-3 px-4 py-3.5"
                style={{
                  borderBottom: i < securityFeatures.length - 1
                    ? `1px solid ${borderColor}`
                    : 'none',
                }}
              >
                <Icon size={18} style={{ color: primaryText, flexShrink: 0 }} />
                <div className="flex-1">
                  <p
                    className="text-sm font-body font-medium"
                    style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: primaryText }}
                  >
                    {feat.title}
                  </p>
                </div>
                <span
                  className="text-[10px] font-body font-semibold px-2 py-1 rounded-md"
                  style={{
                    backgroundColor: feat.active
                      ? (isDark ? 'rgba(224,225,221,0.1)' : 'rgba(27,38,59,0.08)')
                      : (isDark ? 'rgba(224,225,221,0.06)' : 'rgba(27,38,59,0.04)'),
                    color: feat.active ? primaryText : tertiaryText,
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                  }}
                >
                  {feat.status}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Sign out */}
      <div className="px-5 mb-5">
        <button
          onClick={() => signOut().then(() => { window.location.href = '/login'; })}
          className="w-full py-3.5 rounded-2xl text-sm font-bold transition-all"
          style={{
            border: `1px solid ${borderColor}`,
            color: '#C45C6A',
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            backgroundColor: 'transparent',
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
