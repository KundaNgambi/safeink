'use client';

import { useAppStore } from '@/store';
import { useAuthStore } from '@/store/auth';
import Logo from '@/components/common/Logo';

export default function SettingsScreen() {
  const { theme, toggleTheme } = useAppStore();
  const { user, signOut } = useAuthStore();
  const isDark = theme === 'dark';
  const accent = isDark ? '#F4A261' : '#E09049';
  const accentDark = isDark ? '#E09049' : '#C47A38';

  // Calculate real security score based on what's actually implemented
  const hasE2EE = typeof window !== 'undefined' && !!sessionStorage.getItem('obscura_enc_key');
  const hasMfa = false; // Would need to check MFA factors
  const hasRls = true; // DB-level, always on
  const securityScore = [hasE2EE, hasMfa, hasRls].filter(Boolean).length * 33 + 1;

  const generalItems = [
    { icon: '🌐', label: 'Language', value: 'English', chevron: true },
    { icon: '🔔', label: 'Notifications', value: 'On', chevron: true },
    { icon: '💾', label: 'Auto-save', value: 'Enabled', chevron: true },
    { icon: '☁️', label: 'Sync', value: 'Real-time', chevron: true },
    { icon: isDark ? '🌙' : '☀️', label: 'Theme', value: isDark ? 'Dark' : 'Light', chevron: true, onClick: toggleTheme },
  ];

  const securityFeatures = [
    { icon: '🔐', title: 'End-to-End Encryption', status: hasE2EE ? 'Active' : 'Not Set Up', active: hasE2EE },
    { icon: '🛡️', title: 'Two-Factor Authentication', status: hasMfa ? 'Enabled' : 'Not Enabled', active: hasMfa },
    { icon: '🔒', title: 'Row-Level Security', status: 'Active', active: hasRls },
    { icon: '🔑', title: 'Biometric Unlock', status: 'Not Available', active: false },
    { icon: '📋', title: 'Clipboard Protection', status: 'Not Available', active: false },
    { icon: '🔄', title: 'Auto-Lock', status: 'Not Available', active: false },
  ];

  return (
    <div className="flex flex-col h-full overflow-auto pb-24">
      {/* Header */}
      <div className="px-5 pt-5 pb-4">
        <h1
          className="text-2xl font-[800]"
          style={{ fontFamily: 'var(--font-bricolage)', color: isDark ? '#E0E1DD' : '#0D1B2A' }}
        >
          Settings
        </h1>
      </div>

      {/* Account card */}
      <div className="px-5 mb-5">
        <div
          className="flex items-center gap-4 p-5 rounded-2xl glass-card"
          style={{
            backgroundColor: isDark ? '#1B263B' : '#FFFFFF',
            border: `1px solid ${isDark ? 'rgba(119,141,169,0.15)' : 'rgba(13,27,42,0.08)'}`,
            backdropFilter: 'blur(20px)',
          }}
        >
          {/* Avatar */}
          <div
            className="flex-shrink-0 flex items-center justify-center text-xl font-display font-bold"
            style={{
              width: 56,
              height: 56,
              borderRadius: 18,
              background: `linear-gradient(135deg, ${accent}, ${accentDark})`,
              color: isDark ? '#0D1B2A' : '#FFFFFF',
              fontFamily: 'var(--font-bricolage)',
            }}
          >
            {(user?.user_metadata?.full_name || user?.email || 'U')[0].toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <h2
              className="text-base font-bold truncate"
              style={{ fontFamily: 'var(--font-bricolage)', color: isDark ? '#E0E1DD' : '#0D1B2A' }}
            >
              {user?.user_metadata?.full_name || 'User'}
            </h2>
            <p
              className="text-xs truncate"
              style={{ fontFamily: 'var(--font-manrope)', color: isDark ? '#778DA9' : '#415A77' }}
            >
              {user?.email || 'Not signed in'}
            </p>
            <span
              className="inline-block mt-1 px-2 py-0.5 rounded-md text-[10px] font-bold"
              style={{
                backgroundColor: `${accent}20`,
                color: accent,
                fontFamily: 'var(--font-manrope)',
              }}
            >
              PRO
            </span>
          </div>
          <span style={{ color: isDark ? '#415A77' : '#778DA9', fontSize: 18 }}>›</span>
        </div>
      </div>

      {/* General settings */}
      <div className="px-5 mb-5">
        <h3
          className="text-[10px] font-body font-semibold uppercase tracking-widest mb-3 px-1"
          style={{ color: isDark ? '#415A77' : '#778DA9', fontFamily: 'var(--font-manrope)' }}
        >
          General
        </h3>
        <div
          className="rounded-2xl overflow-hidden glass-card"
          style={{
            backgroundColor: isDark ? '#1B263B' : '#FFFFFF',
            border: `1px solid ${isDark ? 'rgba(119,141,169,0.15)' : 'rgba(13,27,42,0.08)'}`,
            backdropFilter: 'blur(20px)',
          }}
        >
          {generalItems.map((item, i) => (
            <button
              key={item.label}
              onClick={item.onClick}
              className="flex items-center gap-3 w-full px-4 py-3.5 text-left transition-colors hover:bg-white/5"
              style={{
                borderBottom: i < generalItems.length - 1
                  ? `1px solid ${isDark ? 'rgba(119,141,169,0.08)' : 'rgba(13,27,42,0.04)'}`
                  : 'none',
              }}
            >
              <span className="text-lg">{item.icon}</span>
              <span
                className="flex-1 text-sm font-body font-medium"
                style={{ fontFamily: 'var(--font-manrope)', color: isDark ? '#E0E1DD' : '#0D1B2A' }}
              >
                {item.label}
              </span>
              <span
                className="text-xs font-body"
                style={{ fontFamily: 'var(--font-manrope)', color: isDark ? '#778DA9' : '#415A77' }}
              >
                {item.value}
              </span>
              {item.chevron && (
                <span style={{ color: isDark ? '#415A77' : '#778DA9', fontSize: 14 }}>›</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Security section */}
      <div className="px-5 mb-5">
        <h3
          className="text-[10px] font-body font-semibold uppercase tracking-widest mb-3 px-1 flex items-center gap-1"
          style={{ color: isDark ? '#415A77' : '#778DA9', fontFamily: 'var(--font-manrope)' }}
        >
          🛡️ Security
        </h3>

        {/* Security score */}
        <div
          className="relative overflow-hidden rounded-2xl p-5 mb-3"
          style={{
            background: 'linear-gradient(135deg, #1B263B, #0D1B2A)',
          }}
        >
          {/* Decorative circle */}
          <div
            className="absolute"
            style={{
              width: 120,
              height: 120,
              borderRadius: '50%',
              border: '2px solid rgba(244,162,97,0.08)',
              top: -20,
              right: -20,
            }}
          />
          <div className="relative z-10">
            <p
              className="text-xs font-body font-semibold mb-1"
              style={{ color: '#778DA9', fontFamily: 'var(--font-manrope)' }}
            >
              Security Score
            </p>
            <p
              className="text-4xl font-display font-[800]"
              style={{ color: '#E0E1DD', fontFamily: 'var(--font-bricolage)' }}
            >
              {securityScore}<span style={{ color: '#778DA9', fontSize: '1rem' }}>/100</span>
            </p>
            <p
              className="text-[10px] font-body mt-1"
              style={{ color: '#778DA9', fontFamily: 'var(--font-manrope)' }}
            >
              {securityScore >= 80 ? 'Excellent' : securityScore >= 50 ? 'Good' : 'Needs Improvement'} — {securityScore >= 80 ? 'Core security features active' : 'Enable more security features'}
            </p>
          </div>
        </div>

        {/* Security features */}
        <div
          className="rounded-2xl overflow-hidden glass-card"
          style={{
            backgroundColor: isDark ? '#1B263B' : '#FFFFFF',
            border: `1px solid ${isDark ? 'rgba(119,141,169,0.15)' : 'rgba(13,27,42,0.08)'}`,
            backdropFilter: 'blur(20px)',
          }}
        >
          {securityFeatures.map((feat, i) => (
            <div
              key={feat.title}
              className="flex items-center gap-3 px-4 py-3.5"
              style={{
                borderBottom: i < securityFeatures.length - 1
                  ? `1px solid ${isDark ? 'rgba(119,141,169,0.08)' : 'rgba(13,27,42,0.04)'}`
                  : 'none',
              }}
            >
              <div
                className="flex items-center justify-center text-base flex-shrink-0"
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  backgroundColor: `${accent}14`,
                }}
              >
                {feat.icon}
              </div>
              <div className="flex-1">
                <p
                  className="text-sm font-body font-medium"
                  style={{ fontFamily: 'var(--font-manrope)', color: isDark ? '#E0E1DD' : '#0D1B2A' }}
                >
                  {feat.title}
                </p>
              </div>
              <span
                className="text-[10px] font-body font-semibold px-2 py-1 rounded-md"
                style={{
                  backgroundColor: feat.active ? `${accent}14` : 'rgba(224,122,142,0.1)',
                  color: feat.active ? accent : '#E07A8E',
                  fontFamily: 'var(--font-manrope)',
                }}
              >
                {feat.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Sign out */}
      <div className="px-5 mb-5">
        <button
          onClick={() => signOut().then(() => { window.location.href = '/login'; })}
          className="w-full py-3.5 rounded-2xl text-sm font-bold transition-all hover:bg-red-500/10"
          style={{
            border: '1px solid rgba(224,122,142,0.3)',
            color: '#E07A8E',
            fontFamily: 'var(--font-manrope)',
          }}
        >
          Sign Out
        </button>
      </div>

      {/* App info */}
      <div className="px-5 pb-8 flex flex-col items-center gap-2">
        <Logo size={32} showWordmark={false} />
        <p
          className="text-[10px]"
          style={{ fontFamily: 'var(--font-jetbrains)', color: isDark ? '#415A77' : '#778DA9' }}
        >
          Obscura v1.0.0
        </p>
      </div>
    </div>
  );
}
