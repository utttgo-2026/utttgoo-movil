import React, { useEffect, useState, type ReactNode } from 'react';
import { Animated, type StyleProp, type ViewStyle } from 'react-native';
import { animateValue } from '@/hooks/useMotion';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { motion } from '@/navigation/motion';

/** One region/message, not each row. No keys, delayed callbacks, cached children or exit retention. */
export function MotionFeedback({ children, trigger, style }: { children: ReactNode; trigger: string; style?: StyleProp<ViewStyle> }) {
  const reduced = useReducedMotion();
  const [opacity] = useState(() => new Animated.Value(1));
  useEffect(() => {
    opacity.stopAnimation();
    if (reduced) opacity.setValue(1);
    else { opacity.setValue(0.9); animateValue(opacity, 1, false, motion.feedback); }
    return () => opacity.stopAnimation();
  }, [trigger, reduced, opacity]);
  return <Animated.View style={[style, { opacity }]}>{children}</Animated.View>;
}
