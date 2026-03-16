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
        backgroundColor: isDark ? 'rgba(18,20,30,0.9)' : 'rgba(255,255,255,0.9)',
        backdropFilter: 'blur(30px)',
        WebkitBackdropFilter: 'blur(30px)',
        borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
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
                    ? `linear-gradient(135deg, ${isDark ? '#BEFF46' : '#4CAF50'}, ${isDark ? '#9BD42A' : '#388E3C'})`
                    : 'transparent',
                  boxShadow: isActive
                    ? `0 4px 16px ${isDark ? 'rgba(190,255,70,0.3)' : 'rgba(76,175,80,0.3)'}`
                    : 'none',
                }}
              >
                <span
                  className="text-lg transition-transform duration-200"
                  style={{
                    opacity: isActive ? 1 : 0.5,
                    color: isActive ? (isDark ? '#0f1117' : '#ffffff') : (isDark ? '#f0f1f4' : '#1a1c24'),
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
                    ? (isDark ? '#BEFF46' : '#4CAF50')
                    : (isDark ? '#8b8fa3' : '#6b7080'),
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
