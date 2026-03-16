'use client';

import { useAppStore } from '@/store';

interface LogoProps {
  size?: number;
  showWordmark?: boolean;
  showTagline?: boolean;
}

/**
 * Obscura Logo — Layered Pages with Lock
 *
 * Two overlapping note pages with a centered lock on the front page.
 * No background container square — the pages themselves are the icon shape.
 *
 * Reference size: 56px. All proportions scale linearly.
 * Keyhole visible at size >= 40, omitted below for clarity.
 */
export default function Logo({ size = 56, showWordmark = true, showTagline = false }: LogoProps) {
  const theme = useAppStore((s) => s.theme);
  const isDark = theme === 'dark';

  // Scale factor from 56px reference
  const s = size / 56;

  // Colors from spec
  const backPageFill = isDark ? '#243447' : '#E0E1DD';
  const frontPageFill = isDark ? '#1B263B' : '#FFFFFF';
  const pageStroke = isDark ? '#415A77' : '#778DA9';
  const lockColor = isDark ? '#F4A261' : '#E09049';
  const keyholeColor = frontPageFill;
  const accentColor = isDark ? '#F4A261' : '#E09049';
  const textColor = isDark ? '#E0E1DD' : '#0D1B2A';
  const taglineColor = isDark ? '#415A77' : '#778DA9';

  // Page dimensions (at 56px: 42×54)
  const pageW = 42 * s;
  const pageH = 54 * s;
  const pageR = 7 * s; // corner radius
  const strokeW = 0.7 * s;

  // Back page offset: 8px right at 56px
  const backOffsetX = 8 * s;
  const backOffsetY = 0;

  // Front page offset: 0px right, 8px down
  const frontOffsetX = 0;
  const frontOffsetY = 8 * s;

  // Total SVG bounds
  const svgW = pageW + backOffsetX;
  const svgH = pageH + frontOffsetY;

  // Lock dimensions (centered on front page)
  const lockBodyW = pageW * 0.38;
  const lockBodyH = lockBodyW * 0.7;
  const lockBodyR = 2.5 * s;
  const lockBodyX = frontOffsetX + (pageW - lockBodyW) / 2;
  const lockBodyY = frontOffsetY + pageH * 0.52;

  // Lock shackle
  const shackleStroke = 2 * s;
  const shackleW = lockBodyW * 0.65;
  const shackleH = lockBodyH * 0.6;
  const shackleCx = lockBodyX + lockBodyW / 2;
  const shackleLeft = shackleCx - shackleW / 2;
  const shackleRight = shackleCx + shackleW / 2;
  const shackleBottom = lockBodyY;
  const shackleTop = shackleBottom - shackleH;
  const shackleRx = shackleW / 2;

  // Keyhole (only at 40px+)
  const showKeyhole = size >= 40;
  const keyholeR = lockBodyW * 0.1;
  const keyholeCx = lockBodyX + lockBodyW / 2;
  const keyholeCy = lockBodyY + lockBodyH * 0.38;
  const keyholePinW = keyholeR * 0.8;
  const keyholePinH = lockBodyH * 0.22;

  return (
    <div className="flex items-center gap-4">
      {/* Icon Mark — Layered Pages with Lock */}
      <svg
        width={svgW}
        height={svgH}
        viewBox={`0 0 ${svgW} ${svgH}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="Obscura logo"
      >
        {/* Back page (top-right) */}
        <rect
          x={backOffsetX}
          y={backOffsetY}
          width={pageW}
          height={pageH}
          rx={pageR}
          fill={backPageFill}
          stroke={pageStroke}
          strokeWidth={strokeW}
        />

        {/* Front page (bottom-left) */}
        <rect
          x={frontOffsetX}
          y={frontOffsetY}
          width={pageW}
          height={pageH}
          rx={pageR}
          fill={frontPageFill}
          stroke={pageStroke}
          strokeWidth={strokeW}
        />

        {/* Lock shackle (arc) */}
        <path
          d={`M${shackleLeft},${shackleBottom} A${shackleRx},${shackleH} 0 0,1 ${shackleRight},${shackleBottom}`}
          stroke={lockColor}
          strokeWidth={shackleStroke}
          strokeLinecap="round"
          fill="none"
        />

        {/* Lock body */}
        <rect
          x={lockBodyX}
          y={lockBodyY}
          width={lockBodyW}
          height={lockBodyH}
          rx={lockBodyR}
          fill={lockColor}
        />

        {/* Keyhole (circle + pin) — only at 40px+ */}
        {showKeyhole && (
          <>
            <circle cx={keyholeCx} cy={keyholeCy} r={keyholeR} fill={keyholeColor} />
            {size >= 56 && (
              <rect
                x={keyholeCx - keyholePinW / 2}
                y={keyholeCy + keyholeR * 0.5}
                width={keyholePinW}
                height={keyholePinH}
                rx={keyholePinW / 2}
                fill={keyholeColor}
              />
            )}
          </>
        )}
      </svg>

      {showWordmark && (
        <div className="flex flex-col">
          {/* Wordmark */}
          <span
            className="font-display font-[700] text-xl leading-tight tracking-tight"
            style={{ fontFamily: "'Plus Jakarta Sans', 'SamsungOne', sans-serif" }}
          >
            <span style={{ color: accentColor }}>O</span>
            <span style={{ color: textColor }}>bscura</span>
          </span>
          {showTagline && (
            <span
              className="text-xs mt-0.5"
              style={{
                color: taglineColor,
                fontFamily: "'Newsreader', serif",
                fontStyle: 'italic',
                fontWeight: 400,
              }}
            >
              Hidden by design.
            </span>
          )}
        </div>
      )}
    </div>
  );
}
