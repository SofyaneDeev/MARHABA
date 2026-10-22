import type { ReactNode } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

/**
 * Slides its content up into place, a little after the item before it.
 * Reanimated skips the animation when the phone asks for reduced motion.
 */
export function GlideIn({ index = 0, children, style }: { index?: number; children: ReactNode; style?: StyleProp<ViewStyle> }) {
  // Cap the delay so long lists don't keep the last items waiting.
  const delay = Math.min(index, 8) * 55;
  return (
    <Animated.View entering={FadeInDown.delay(delay).duration(380)} style={style}>
      {children}
    </Animated.View>
  );
}
