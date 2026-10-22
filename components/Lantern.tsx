import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

import { fonts, useThemeColors } from '@/constants/theme';

/** A Moroccan lantern that swings and glows while something loads. */
export function Lantern({ label = 'Loading…', size = 64 }: { label?: string; size?: number }) {
  const c = useThemeColors();
  const reduceMotion = useReducedMotion();
  const swing = useSharedValue(0);
  const glow = useSharedValue(0.55);

  useEffect(() => {
    if (reduceMotion) return;
    const ease = { duration: 900, easing: Easing.inOut(Easing.sin) };
    swing.set(-1);
    swing.set(withRepeat(withTiming(1, ease), -1, true));
    glow.set(withRepeat(withTiming(1, ease), -1, true));
    return () => {
      cancelAnimation(swing);
      cancelAnimation(glow);
    };
  }, [reduceMotion, swing, glow]);

  // Swing from the hook at the top.
  const swingStyle = useAnimatedStyle(() => ({ transform: [{ rotate: `${swing.get() * 10}deg` }] }));
  const glowStyle = useAnimatedStyle(() => ({ opacity: glow.get() }));

  const w = size * 0.625;
  const metal = c.saffron;

  return (
    <View style={styles.wrap} accessibilityRole="progressbar" accessibilityLabel={label}>
      <Animated.View style={[{ width: w, height: size, transformOrigin: 'top' }, swingStyle]}>
        <Animated.View
          style={[
            styles.glow,
            { left: w * 0.3, top: size * 0.3, width: w * 0.4, height: size * 0.38, backgroundColor: '#FFD27A' },
            glowStyle,
          ]}
        />
        <Svg width={w} height={size} viewBox="0 0 40 64">
          <Circle cx={20} cy={3.5} r={2.5} fill="none" stroke={metal} strokeWidth={1.5} />
          <Path d="M16 6 H24 L27 11 H13 Z" fill={metal} />
          <Path d="M9 18 Q20 4 31 18 Z" fill={metal} />
          <Rect x={10} y={18} width={20} height={27} rx={2} fill="none" stroke={metal} strokeWidth={2} />
          <Path d="M14 45 V28 Q17 22 20 28 V45 M20 45 V28 Q23 22 26 28 V45" fill="none" stroke={metal} strokeWidth={1.2} />
          <Path d="M7 45 H33 L27 52 H13 Z" fill={metal} />
          <Path d="M17 52 H23 L20 60 Z" fill={metal} />
        </Svg>
      </Animated.View>
      <Text style={[styles.label, { color: c.muted }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center', paddingVertical: 20, gap: 8 },
  glow: { position: 'absolute', borderRadius: 999 },
  label: { fontFamily: fonts.medium, fontSize: 13 },
});
