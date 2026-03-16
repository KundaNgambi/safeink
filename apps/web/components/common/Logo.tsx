'use client';

import { useAppStore } from '@/store';

interface LogoProps {
  size?: number;
}

export default function Logo({ size = 40 }: LogoProps) {
  const theme = useAppStore((s) => s.theme);
  const isDark = theme === 'dark';
  const color = isDark ? '#E0E1DD' : '#1B263B';

  const r = size * 0.393;
  const sw = size * 0.08;
  const dash = r * 2 * Math.PI * 0.875;
  const gap = r * 2 * Math.PI * 0.125;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-label="Obscura logo">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth={sw}
        strokeLinecap="round"
        strokeDasharray={`${dash} ${gap}`}
      />
    </svg>
  );
}
