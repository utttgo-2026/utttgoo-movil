import { useCallback, useEffect, useRef, useState } from 'react';
import { Animated } from 'react-native';
import { motion } from '@/navigation/motion';
import { useReducedMotion } from './useReducedMotion';

export function animateValue(value: Animated.Value, target: number, reduced: boolean, duration: number) {
  value.stopAnimation();
  if (reduced) { value.setValue(target); return; }
  Animated.timing(value, { toValue: target, duration, easing: motion.easing, useNativeDriver: true, isInteraction: false }).start();
}

/** Retarget from the current native value, never queue a completion callback that could become stale. */
export function useMotionValue(target: number, duration: number, reduced: boolean) {
  const [value] = useState(() => new Animated.Value(target));
  const previous = useRef(target);
  useEffect(() => {
    if (reduced || previous.current !== target) animateValue(value, target, reduced, duration);
    previous.current = target;
    return () => value.stopAnimation();
  }, [target, duration, reduced, value]);
  return value;
}

export function usePressMotion(disabled = false) {
  const reduced = useReducedMotion();
  const [scale] = useState(() => new Animated.Value(1));
  useEffect(() => {
    if (disabled || reduced) { scale.stopAnimation(); scale.setValue(1); }
    return () => scale.stopAnimation();
  }, [disabled, reduced, scale]);
  const onPressIn = useCallback(() => {
    if (!disabled && !reduced) animateValue(scale, 0.98, false, motion.pressIn);
  }, [disabled, reduced, scale]);
  const onPressOut = useCallback(() => animateValue(scale, 1, disabled || reduced, motion.pressOut), [disabled, reduced, scale]);
  return { onPressIn, onPressOut, style: { transform: [{ scale }] } };
}
