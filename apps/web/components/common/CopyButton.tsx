'use client';

import { useState, useCallback } from 'react';
import { useAppStore } from '@/store';

interface CopyButtonProps {
  text: string;
  size?: 'sm' | 'lg';
}

export default function CopyButton({ text, size = 'sm' }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);
  const theme = useAppStore((s) => s.theme);
  const isDark = theme === 'dark';
  const accent = isDark ? '#F4A261' : '#E09049';

  const handleCopy = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    },
    [text]
  );

  const padding = size === 'sm' ? '5px 12px' : '8px 18px';
  const fontSize = size === 'sm' ? 11 : 13;

  return (
    <button
      onClick={handleCopy}
      className="font-body font-semibold rounded-lg transition-all duration-250 ease-in-out"
      style={{
        padding,
        fontSize,
        fontFamily: 'var(--font-manrope)',
        backgroundColor: copied ? accent : `${accent}14`,
        color: copied ? (isDark ? '#0D1B2A' : '#FFFFFF') : accent,
        border: `1px solid ${copied ? accent : `${accent}33`}`,
        transform: copied ? 'scale(1.05)' : 'scale(1)',
        boxShadow: copied ? `0 0 16px ${accent}66` : 'none',
      }}
    >
      {copied ? 'Copied!' : 'Copy'}
    </button>
  );
}
