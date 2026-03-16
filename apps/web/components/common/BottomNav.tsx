'use client';

import { useAppStore } from '@/store';

const tabs = [
  { id: 'notes' as const, label: 'Notes', icon: '◈' },
  { id: 'categories' as const, label: 'Categories', icon: '📂' },
  { id: 'settings' as const, label: 'Settings', icon: '⚙' },
];

export default function BottomNav() {
  const { activeTab, setActiveTab, theme } = useAppStore();
  const isDark = theme === 'dark';

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 glass-card"
      style={{
        backgroundColor: isDark ? 'rgba(13,27,42,0.95)' : 'rgba(248,247,244,0.95)',
        backdropFilter: 'blur(30px)',
        WebkitBackdropFilter: 'blur(30px)',
        borderTop: `1px solid ${isDark ? 'rgba(119,141,169,0.15)' : 'rgba(13,27,42,0.08)'}`,
      }}
    >
      <div className="flex items-center justify-around px-6 pt-2 pb-2 max-w-lg mx-auto">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="flex flex-col items-center gap-1 transition-all duration-200"
            >
              <div
                className="flex items-center justify-center transition-all duration-200"
                style={{
                  width: isActive ? 48 : 32,
                  height: 32,
                  borderRadius: 16,
                  background: isActive
                    ? `linear-gradient(135deg, ${isDark ? '#F4A261' : '#E09049'}, ${isDark ? '#E09049' : '#C47A38'})`
                    : 'transparent',
                  boxShadow: isActive
                    ? `0 4px 16px ${isDark ? 'rgba(244,162,97,0.3)' : 'rgba(224,144,73,0.3)'}`
                    : 'none',
                }}
              >
                <span
                  className="text-lg transition-transform duration-200"
                  style={{
                    opacity: isActive ? 1 : 0.5,
                    color: isActive ? (isDark ? '#0D1B2A' : '#FFFFFF') : (isDark ? '#E0E1DD' : '#0D1B2A'),
                    transform: isActive ? 'scale(1.1)' : 'scale(1)',
                  }}
                >
                  {tab.icon}
                </span>
              </div>
              <span
                className="text-[10px] font-body font-medium"
                style={{
                  color: isActive
                    ? (isDark ? '#F4A261' : '#E09049')
                    : (isDark ? '#778DA9' : '#415A77'),
                  fontFamily: 'var(--font-manrope)',
                }}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
