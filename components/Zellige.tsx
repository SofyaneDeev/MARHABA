import { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Defs, G, Path, Pattern, Rect } from 'react-native-svg';

/**
 * A repeating zellige lattice: eight-point stars (two overlapping squares)
 * joined to their neighbours, drawn as thin lines over whatever is behind it.
 */
export function ZelligePattern({
  id,
  color = '#FFFFFF',
  opacity = 0.14,
  size = 48,
}: {
  id: string;
  color?: string;
  opacity?: number;
  size?: number;
}) {
  const s = size;
  const half = s / 2;
  const side = s * 0.46;
  const offset = (s - side) / 2;
  // Distance from the centre to a tip of the rotated square.
  const tip = (side * Math.SQRT2) / 2;

  return (
    <Svg width="100%" height="100%" style={StyleSheet.absoluteFill} pointerEvents="none">
      <Defs>
        <Pattern id={id} patternUnits="userSpaceOnUse" width={s} height={s}>
          <G fill="none" stroke={color} strokeWidth={1.3} opacity={opacity}>
            <Rect x={offset} y={offset} width={side} height={side} />
            <Rect x={offset} y={offset} width={side} height={side} transform={`rotate(45 ${half} ${half})`} />
            <Path
              d={`M${half} 0V${half - tip} M${half} ${s}V${half + tip} M0 ${half}H${half - tip} M${s} ${half}H${half + tip}`}
            />
          </G>
        </Pattern>
      </Defs>
      <Rect width="100%" height="100%" fill={`url(#${id})`} />
    </Svg>
  );
}

/** The zellige lattice, drifting slowly and seamlessly diagonally. */
export function DriftingZellige({ id, size = 48, seconds = 24 }: { id: string; size?: number; seconds?: number }) {
  const reduceMotion = useReducedMotion();
  const shift = useSharedValue(0);

  useEffect(() => {
    if (reduceMotion) return;
    // Moving exactly one tile, then jumping back, looks endless.
    shift.set(withRepeat(withTiming(size, { duration: seconds * 1000, easing: Easing.linear }), -1, false));
    return () => cancelAnimation(shift);
  }, [reduceMotion, shift, size, seconds]);

  const style = useAnimatedStyle(() => ({
    transform: [{ translateX: shift.get() }, { translateY: shift.get() }],
  }));

  return (
    <Animated.View pointerEvents="none" style={[{ position: 'absolute', top: -size, left: -size, right: -size, bottom: -size }, style]}>
      <ZelligePattern id={id} size={size} />
    </Animated.View>
  );
}
