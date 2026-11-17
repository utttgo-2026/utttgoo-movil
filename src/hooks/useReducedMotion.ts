import { useSyncExternalStore } from 'react';
import { AccessibilityInfo } from 'react-native';

// Conservative until the system has answered. One native subscription for all visual consumers.
let reduced = true;
let generation = 0;
const listeners = new Set<() => void>();
let subscription: ReturnType<typeof AccessibilityInfo.addEventListener> | undefined;
function publish(value: boolean) {
  if (reduced === value) return;
  reduced = value;
  listeners.forEach((listener) => listener());
}
function subscribe(listener: () => void) {
  listeners.add(listener);
  if (listeners.size === 1) {
    const current = ++generation;
    let changed = false;
    subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', (value) => {
      if (current !== generation) return;
      changed = true;
      publish(value);
    });
    try {
      void Promise.resolve(AccessibilityInfo.isReduceMotionEnabled()).then((value) => {
        if (current === generation && !changed) publish(value !== false);
      }).catch(() => { /* Keep motion reduced when the preference is unavailable. */ });
    } catch { /* Native preference unavailable: remain conservative. */ }
  }
  return () => {
    listeners.delete(listener);
    if (!listeners.size) {
      ++generation;
      subscription?.remove(); subscription = undefined;
      reduced = true;
    }
  };
}
export function useReducedMotion(): boolean {
  return useSyncExternalStore(subscribe, () => reduced, () => true);
}
