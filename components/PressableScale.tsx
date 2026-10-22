import * as Haptics from 'expo-haptics';
import { Platform, Pressable, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useReducedMotion, useSharedValue, withSpring } from 'react-native-reanimated';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
const SPRING = { damping: 14, stiffness: 320, mass: 0.6 };

type Props = Omit<PressableProps, 'style'> & {
  style?: StyleProp<ViewStyle>;
  /** A light tap on the phone when pressed (not on the web). */
  haptic?: boolean;
  /** How far the button shrinks while held. */
  scaleTo?: number;
};

/** A button that springs in when pressed and gives a light haptic tap. */
export function PressableScale({ style, haptic = true, scaleTo = 0.95, onPressIn, onPressOut, onPress, ...rest }: Props) {
  const scale = useSharedValue(1);
  const reduceMotion = useReducedMotion();
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.get() }] }));

  return (
    <AnimatedPressable
      {...rest}
      onPressIn={(e) => {
        if (!reduceMotion) scale.set(withSpring(scaleTo, SPRING));
        onPressIn?.(e);
      }}
      onPressOut={(e) => {
        scale.set(withSpring(1, SPRING));
        onPressOut?.(e);
      }}
      onPress={(e) => {
        if (haptic && Platform.OS !== 'web') {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
        }
        onPress?.(e);
      }}
      style={[style, animatedStyle]}
    />
  );
}
