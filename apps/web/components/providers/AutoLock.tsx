'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useAppStore } from '@/store';
import { useAuthStore } from '@/store/auth';

export default function AutoLockProvider({ children }: { children: React.ReactNode }) {
  const { autoLockEnabled, autoLockTimeout, setLocked } = useAppStore();
  const user = useAuthStore((s) => s.user);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const resetTimer = useCallback(() => {
    if (!autoLockEnabled || !user) return;

    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(() => {
      setLocked(true);
    }, autoLockTimeout * 60 * 1000);
  }, [autoLockEnabled, autoLockTimeout, user, setLocked]);

  useEffect(() => {
    if (!autoLockEnabled || !user) {
      if (timerRef.current) clearTimeout(timerRef.current);
      return;
    }

    const events = ['mousedown', 'keydown', 'touchstart', 'scroll', 'mousemove'];
    events.forEach((e) => window.addEventListener(e, resetTimer, { passive: true }));
    resetTimer();

    // Lock when tab becomes hidden (user switches away)
    const handleVisibility = () => {
      if (document.visibilityState === 'hidden') {
        // Start a shorter timer when tab is hidden
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => {
          setLocked(true);
        }, Math.min(autoLockTimeout * 60 * 1000, 60000)); // Lock sooner when hidden (max 1 min)
      } else {
        resetTimer();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      events.forEach((e) => window.removeEventListener(e, resetTimer));
      document.removeEventListener('visibilitychange', handleVisibility);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [autoLockEnabled, autoLockTimeout, user, resetTimer, setLocked]);

  return <>{children}</>;
}
