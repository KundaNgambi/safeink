'use client';

import { useState } from 'react';
import { useAppStore } from '@/store';
import { Pencil, LayoutGrid, Settings } from 'lucide-react';

const tabs = [
  { id: 'notes' as const, icon: Pencil, label: 'Notes' },
  { id: 'categories' as const, icon: LayoutGrid, label: 'Categories' },
  { id: 'settings' as const, icon: Settings, label: 'Settings' },
];

export default function BottomNav() {
  const { activeTab, setActiveTab, theme } = useAppStore();
  const isDark = theme === 'dark';
  const [hoveredTab, setHoveredTab] = useState<string | null>(null);

  const pillBg = isDark ? 'rgba(224,225,221,0.08)' : 'rgba(27,38,59,0.06)';
  const pillBorder = isDark ? 'rgba(224,225,221,0.12)' : 'rgba(27,38,59,0.1)';
  const hoverBg = isDark ? 'rgba(224,225,221,0.12)' : 'rgba(27,38,59,0.08)';
  const iconColor = isDark ? '#E0E1DD' : '#1B263B';

  return (
    <div
      className="fixed z-[60] flex flex-col items-center"
      style={{ bottom: 20, left: '50%', transform: 'translateX(-50%)' }}
    >
      {/* Tooltip */}
      {hoveredTab && (
        <div
          className="mb-1.5 px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap"
          style={{
            backgroundColor: isDark ? '#243447' : '#FFFFFF',
            border: `1px solid ${pillBorder}`,
            color: isDark ? '#E0E1DD' : '#1B263B',
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            backdropFilter: 'blur(12px)',
          }}
        >
          {hoveredTab}
        </div>
      )}
      {/* Pill bar */}
      <div
        className="flex items-center gap-[3px] px-1.5"
        style={{
          height: 44,
          borderRadius: 22,
          background: pillBg,
          border: `1px solid ${pillBorder}`,
          backdropFilter: 'blur(16px)',
        }}
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              onMouseEnter={() => setHoveredTab(tab.label)}
              onMouseLeave={() => setHoveredTab(null)}
              className="relative flex items-center justify-center transition-all duration-200"
              style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                background: isActive ? hoverBg : 'transparent',
              }}
            >
              <Icon
                size={18}
                strokeWidth={1.5}
                style={{
                  color: iconColor,
                  opacity: isActive ? 1 : 0.45,
                  transition: 'opacity 0.2s',
                }}
              />
              {isActive && (
                <div
                  className="absolute"
                  style={{
                    bottom: 2,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: 4,
                    height: 4,
                    borderRadius: 2,
                    backgroundColor: iconColor,
                  }}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
