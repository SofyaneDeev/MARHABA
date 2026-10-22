import { useEffect } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { fonts, useThemeColors } from '@/constants/theme';

// Transparent PNG, so he stands directly on the chat background.
const GUIDE = require('@/assets/images/guide.png');
/** The source picture is square. */
const SOURCE_SIZE = 500;
/** The square around his face and fez, in source pixels. */
const FACE = { left: 137, top: 4, size: 196 };

/** A round crop of the guide's face, for chat bubbles and the guide bar. */
export function GuideAvatar({ size }: { size: number }) {
  const c = useThemeColors();
  const scale = size / FACE.size;
  return (
    <View
      style={[styles.avatar, { width: size, height: size, borderRadius: size / 2, backgroundColor: c.surfaceAlt }]}
      accessibilityRole="image"
      accessibilityLabel="Marhaba guide">
      <Image
        source={GUIDE}
        style={{
          position: 'absolute',
          width: SOURCE_SIZE * scale,
          height: SOURCE_SIZE * scale,
          left: -FACE.left * scale,
          top: -FACE.top * scale,
        }}
      />
    </View>
  );
}

/** The guide bar above the message box: who you're talking to. */
export function GuideBar() {
  const c = useThemeColors();
  return (
    <View style={[styles.bar, { borderTopColor: c.line, backgroundColor: c.surface }]}>
      <View>
        <GuideAvatar size={40} />
        <View style={[styles.online, { backgroundColor: c.mint, borderColor: c.surface }]} />
      </View>
      <View style={styles.barText}>
        <Text style={[styles.barTitle, { color: c.text }]}>Your Marhaba guide</Text>
        <Text style={[styles.barSub, { color: c.muted }]}>AI assistant · answers in your language</Text>
      </View>
    </View>
  );
}

/** The full guide picture, gently floating, shown before the first question. */
export function GuideHero({ size = 200 }: { size?: number }) {
  const reduceMotion = useReducedMotion();
  const float = useSharedValue(0);

  useEffect(() => {
    if (reduceMotion) return;
    float.set(withRepeat(withTiming(1, { duration: 1800, easing: Easing.inOut(Easing.sin) }), -1, true));
    return () => cancelAnimation(float);
  }, [reduceMotion, float]);

  const floatStyle = useAnimatedStyle(() => ({ transform: [{ translateY: -6 * float.get() }] }));

  return (
    <Animated.View style={[styles.hero, floatStyle]}>
      <Image
        source={GUIDE}
        style={{ width: size, height: size }}
        accessibilityRole="image"
        accessibilityLabel="Your Marhaba guide, a young Moroccan man in a fez and djellaba, holding a tablet"
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  avatar: { overflow: 'hidden' },
  bar: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 16, paddingVertical: 8, borderTopWidth: 1 },
  online: { position: 'absolute', right: 0, bottom: 0, width: 11, height: 11, borderRadius: 6, borderWidth: 2 },
  barText: { flex: 1, minWidth: 0 },
  barTitle: { fontFamily: fonts.bold, fontSize: 14.5 },
  barSub: { fontFamily: fonts.body, fontSize: 12.5 },
  hero: { alignSelf: 'center' },
});
