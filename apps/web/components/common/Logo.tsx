'use client';

import { useAppStore } from '@/store';

interface LogoProps {
  size?: number;
  showWordmark?: boolean;
  showTagline?: boolean;
}

export default function Logo({ size = 56, showWordmark = true, showTagline = false }: LogoProps) {
  const theme = useAppStore((s) => s.theme);
  const isDark = theme === 'dark';

  const accent = isDark ? '#BEFF46' : '#4CAF50';
  const bg = isDark ? '#0f1117' : '#ffffff';
  const textColor = isDark ? '#f0f1f4' : '#1a1c24';
  const radius = Math.round((16 / 56) * size);
  const badgeSize = Math.round(size * 0.39);
  const fontSize = Math.round(size * 0.55);

  return (
    <div className="flex items-center gap-3">
      {/* Icon Mark */}
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} fill="none">
        {/* Rounded square background */}
        <rect width={size} height={size} rx={radius} fill={accent} />
        {/* S letterform */}
        <text
          x={size / 2}
          y={size / 2 + fontSize * 0.35}
          textAnchor="middle"
          fontFamily="'Bricolage Grotesque', sans-serif"
          fontWeight={800}
          fontSize={fontSize}
          fill={bg}
        >
          S
        </text>
        {/* Lock badge */}
        <g transform={`translate(${size - badgeSize * 0.7}, ${size - badgeSize * 0.7})`}>
          <rect
            x={-badgeSize * 0.3}
            y={-badgeSize * 0.3}
            width={badgeSize}
            height={badgeSize}
            rx={badgeSize * 0.2}
            fill={bg}
            stroke={accent}
            strokeWidth={1.2}
          />
          {/* Lock body */}
          <rect
            x={badgeSize * 0.1}
            y={badgeSize * 0.18}
            width={badgeSize * 0.4}
            height={badgeSize * 0.3}
            rx={2}
            fill={accent}
          />
          {/* Lock shackle */}
          <path
            d={`M${badgeSize * 0.15},${badgeSize * 0.2}
               Q${badgeSize * 0.15},${-badgeSize * 0.02} ${badgeSize * 0.3},${-badgeSize * 0.02}
               Q${badgeSize * 0.45},${-badgeSize * 0.02} ${badgeSize * 0.45},${badgeSize * 0.2}`}
            stroke={accent}
            strokeWidth={1.5}
            strokeLinecap="round"
            fill="none"
          />
          {/* Keyhole */}
          {size > 24 && (
            <circle cx={badgeSize * 0.3} cy={badgeSize * 0.32} r={badgeSize * 0.06} fill={bg} />
          )}
        </g>
      </svg>

      {showWordmark && (
        <div className="flex flex-col">
          {/* Wordmark */}
          <span
            className="font-display font-[800] text-xl leading-tight tracking-tight"
            style={{ fontFamily: 'var(--font-bricolage)' }}
          >
            <span style={{ color: textColor }}>safe</span>
            <span style={{ color: accent }}>ink</span>
          </span>
          {showTagline && (
            <span
              className="text-xs font-body"
              style={{ color: isDark ? '#8b8fa3' : '#6b7080', fontFamily: 'var(--font-manrope)' }}
            >
              Your thoughts, encrypted.
            </span>
          )}
        </div>
      )}
    </div>
  );
}
