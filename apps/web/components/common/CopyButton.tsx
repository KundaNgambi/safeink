'use client';

import { useState, useCallback } from 'react';
import { useAppStore } from '@/store';
import { Copy, Check } from 'lucide-react';

interface CopyButtonProps {
  text: string;
  size?: 'sm' | 'lg';
}

export default function CopyButton({ text, size = 'sm' }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);
  const theme = useAppStore((s) => s.theme);
  const isDark = theme === 'dark';

  const primary = isDark ? '#E0E1DD' : '#1B263B';
  const bg = isDark ? '#1B263B' : '#E0E1DD';
  const border = isDark ? 'rgba(224,225,221,0.12)' : 'rgba(27,38,59,0.12)';

  const handleCopy = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      navigator.clipboard.writeText(text).catch(() => {});
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    },
    [text]
  );

  const padding = size === 'sm' ? '4px 12px' : '8px 18px';
  const iconSize = size === 'sm' ? 12 : 14;

  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-1.5 font-medium rounded-lg transition-all duration-200"
      style={{
        padding,
        fontSize: size === 'sm' ? 11 : 13,
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        backgroundColor: copied ? primary : 'transparent',
        color: copied ? bg : isDark ? 'rgba(224,225,221,0.6)' : 'rgba(27,38,59,0.6)',
        border: `1.5px solid ${copied ? primary : border}`,
      }}
    >
      {copied ? <Check size={iconSize} strokeWidth={2} /> : <Copy size={iconSize} strokeWidth={1.5} />}
      <span>{copied ? 'Copied' : 'Copy'}</span>
    </button>
  );
}
