import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';

/** Three dots that bounce one after another while the assistant writes. */
export function TypingDots({ color }: { color: string }) {
  const reduceMotion = useReducedMotion();
  const a = useSharedValue(0);
  const b = useSharedValue(0);
  const c = useSharedValue(0);

  useEffect(() => {
    if (reduceMotion) return;
    const dots = [a, b, c];
    dots.forEach((dot, i) => {
      dot.set(
        withDelay(
          i * 140,
          withRepeat(
            withSequence(
              withTiming(1, { duration: 280, easing: Easing.out(Easing.quad) }),
              withTiming(0, { duration: 280, easing: Easing.in(Easing.quad) }),
              withTiming(0, { duration: 260 }),
            ),
            -1,
          ),
        ),
      );
    });
    return () => dots.forEach((dot) => cancelAnimation(dot));
  }, [reduceMotion, a, b, c]);

  return (
    <View style={styles.row} accessibilityRole="progressbar" accessibilityLabel="Marhaba is writing">
      <Dot value={a} color={color} />
      <Dot value={b} color={color} />
      <Dot value={c} color={color} />
    </View>
  );
}

function Dot({ value, color }: { value: SharedValue<number>; color: string }) {
  const style = useAnimatedStyle(() => ({
    transform: [{ translateY: -5 * value.get() }],
    opacity: 0.45 + 0.55 * value.get(),
  }));
  return <Animated.View style={[styles.dot, { backgroundColor: color }, style]} />;
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 5, paddingVertical: 6, paddingHorizontal: 2 },
  dot: { width: 8, height: 8, borderRadius: 4 },
});
