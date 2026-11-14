import { useEffect, useState, useSyncExternalStore } from 'react';
import { pendingRegistration } from '@/services/pendingRegistration';

export function usePendingRegistration() {
  const snapshot = useSyncExternalStore(pendingRegistration.subscribe, pendingRegistration.getSnapshot, pendingRegistration.getSnapshot);
  const [now, setNow] = useState(Date.now);
  useEffect(() => {
    if (!snapshot) return;
    const timer = setInterval(() => {
      const time = Date.now();
      setNow(time);
      if (snapshot.expiresAt <= time) pendingRegistration.clear(snapshot.id);
    }, 1000);
    return () => clearInterval(timer);
  }, [snapshot]);
  const pending = snapshot && snapshot.expiresAt > now ? snapshot : null;
  return {
    pending,
    resendSeconds: pending ? Math.max(0, Math.ceil((pending.resendAt - now) / 1000)) : 0,
    blockedSeconds: pending ? Math.max(0, Math.ceil((pending.blockedUntil - now) / 1000)) : 0,
  };
}
