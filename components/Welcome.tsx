import { SymbolView, type SymbolViewProps } from 'expo-symbols';
import { createContext, useContext, useEffect } from 'react';
import { StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  FadeIn,
  FadeInDown,
  FadeInUp,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
  ZoomIn,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PressableScale } from '@/components/PressableScale';
import { DriftingZellige } from '@/components/Zellige';
import { fonts, palette } from '@/constants/theme';

/** Lets any screen reopen the welcome screen. */
export const WelcomeContext = createContext<{ showWelcome: () => void }>({ showWelcome: () => {} });
export const useWelcome = () => useContext(WelcomeContext);

// The guide in a Moroccan street, cropped from the welcome artwork without its text.
const SCENE = require('@/assets/images/welcome-scene.jpg');
// Colours sampled from the artwork so the code-drawn parts join it seamlessly.
const SCENE_BLUE = '#0C45C5';
const SCENE_WHITE = '#F6FAFD';
const INK = '#1534A6';

const MAX_WIDTH = 480;

const FEATURES: { label: string; icon: SymbolViewProps['name'] }[] = [
  { label: 'Discover places', icon: { ios: 'mappin.and.ellipse', android: 'location_on', web: 'location_on' } },
  { label: 'Get around easily', icon: { ios: 'bus.fill', android: 'directions_bus', web: 'directions_bus' } },
  { label: 'Find the best food', icon: { ios: 'fork.knife', android: 'restaurant', web: 'restaurant' } },
  { label: 'Ask about local culture', icon: { ios: 'bubble.left.and.bubble.right.fill', android: 'forum', web: 'forum' } },
];

// The order things arrive in.
const T_ARABIC = 350;
const T_TIFINAGH = 650;
const T_SCENE = 200;
const T_PANEL = 900;

/** Letters that appear one after another. Only for scripts whose letters don't join. */
function SpelledOut({ text, style, start, step = 60 }: { text: string; style: object; start: number; step?: number }) {
  return (
    <View style={styles.row} accessible accessibilityLabel={text}>
      {Array.from(text).map((ch, i) => (
        <Animated.Text key={i} entering={FadeInDown.delay(start + i * step).duration(320)} style={style}>
          {ch}
        </Animated.Text>
      ))}
    </View>
  );
}

/** The scene fills the space left between the title and the panel, with a slow zoom so the street feels alive. */
function LivingScene() {
  const reduceMotion = useReducedMotion();
  const zoom = useSharedValue(1);

  useEffect(() => {
    if (reduceMotion) return;
    zoom.set(withRepeat(withTiming(1.06, { duration: 9000, easing: Easing.inOut(Easing.sin) }), -1, true));
    return () => cancelAnimation(zoom);
  }, [reduceMotion, zoom]);

  const zoomStyle = useAnimatedStyle(() => ({ transform: [{ scale: zoom.get() }] }));

  return (
    <Animated.View entering={FadeIn.delay(T_SCENE).duration(700)} style={styles.sceneFrame}>
      <Animated.Image
        source={SCENE}
        resizeMode="cover"
        style={[styles.sceneImage, zoomStyle]}
        accessibilityRole="image"
        accessibilityLabel="Your Marhaba guide in a fez and djellaba, in a blue Moroccan street with mountains behind"
      />
    </Animated.View>
  );
}

export function WelcomeScreen({ onStart }: { onStart: () => void }) {
  const insets = useSafeAreaInsets();
  const { width: windowWidth, height } = useWindowDimensions();
  const width = Math.min(windowWidth, MAX_WIDTH);
  // Small phones: tighter spacing so everything fits on one screen, with no scrolling.
  const compact = height < 760;

  return (
    <View style={styles.root}>
      <View style={[styles.column, { width, paddingBottom: insets.bottom + (compact ? 10 : 18) }]}>
          {/* Title band in the artwork's blue, with the zellige lattice drifting behind. */}
          <View style={[styles.band, { paddingTop: insets.top + (compact ? 12 : 24) }]}>
            <DriftingZellige id="welcome-zellige" />
            <SpelledOut text="Marhaba" style={styles.latin} start={0} />
            <Animated.Text entering={ZoomIn.delay(T_ARABIC).duration(550)} style={styles.arabic} accessibilityLabel="Marhaba in Arabic">
              مرحبا
            </Animated.Text>
            <SpelledOut text="ⴰⵏⵙⵓⴼ" style={styles.tifinagh} start={T_TIFINAGH} step={80} />
            <Animated.Text entering={FadeInUp.delay(T_TIFINAGH + 300).duration(450)} style={styles.tagline}>
              Your Morocco travel companion
            </Animated.Text>
          </View>

          <LivingScene />

          <View style={[styles.panel, compact && styles.panelCompact]}>
            <Animated.Text entering={FadeInUp.delay(T_PANEL).duration(500)} style={[styles.headline, compact && styles.headlineCompact]}>
              Your Morocco adventure starts here
            </Animated.Text>
            <Animated.Text entering={FadeInUp.delay(T_PANEL + 100).duration(500)} style={styles.sub}>
              Ask Marhaba for tips, local advice and fair prices, and everything you need for an unforgettable trip.
            </Animated.Text>

            <View style={styles.features}>
              {FEATURES.map((f, i) => (
                <Animated.View
                  key={f.label}
                  entering={FadeInDown.delay(T_PANEL + 250 + i * 110).duration(450)}
                  style={[styles.feature, i > 0 && styles.featureDivider]}>
                  <SymbolView name={f.icon} tintColor={SCENE_BLUE} size={30} />
                  <Text style={styles.featureLabel}>{f.label}</Text>
                </Animated.View>
              ))}
            </View>

            <Animated.View entering={ZoomIn.delay(T_PANEL + 750).springify()} style={styles.startWrap}>
              <PressableScale accessibilityRole="button" accessibilityLabel="Get started" onPress={onStart} style={styles.start}>
                <Text style={styles.startText}>Get Started</Text>
                <Text style={styles.startArrow}>→</Text>
              </PressableScale>
            </Animated.View>

            {compact ? null : (
              <Animated.Text entering={FadeIn.delay(T_PANEL + 1100)} style={styles.footnote}>
                “Marhaba” means welcome in Arabic. “Ansuf” (ⴰⵏⵙⵓⴼ) means welcome in Amazigh.
              </Animated.Text>
            )}
          </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: SCENE_WHITE, alignItems: 'center' },
  column: { flex: 1, backgroundColor: SCENE_WHITE },
  band: { backgroundColor: SCENE_BLUE, alignItems: 'center', paddingBottom: 6, overflow: 'hidden', gap: 2 },
  row: { flexDirection: 'row' },
  latin: { fontFamily: fonts.display, fontSize: 46, lineHeight: 56, color: '#FFFFFF' },
  arabic: { fontFamily: fonts.display, fontSize: 38, lineHeight: 52, color: '#FFFFFF' },
  tifinagh: { fontFamily: fonts.tifinagh, fontSize: 22, color: palette.saffron, marginHorizontal: 2 },
  tagline: { fontFamily: fonts.body, fontSize: 15, color: 'rgba(255,255,255,0.88)', marginTop: 2 },
  // The artwork's arch opens out of the blue band, so they touch with no gap.
  sceneFrame: { flex: 1, minHeight: 90, overflow: 'hidden', marginTop: -1 },
  sceneImage: { width: '100%', height: '100%' },
  panel: { paddingHorizontal: 22, paddingTop: 10, alignItems: 'center', gap: 12 },
  panelCompact: { gap: 8, paddingTop: 6 },
  headline: { fontFamily: fonts.display, fontSize: 27, lineHeight: 34, color: INK, textAlign: 'center' },
  headlineCompact: { fontSize: 23, lineHeight: 29 },
  sub: { fontFamily: fonts.body, fontSize: 15, lineHeight: 22, color: '#4A5585', textAlign: 'center', maxWidth: 380 },
  features: { flexDirection: 'row', alignSelf: 'stretch', marginTop: 4 },
  feature: { flex: 1, alignItems: 'center', gap: 6, paddingHorizontal: 4 },
  featureDivider: { borderLeftWidth: 1, borderLeftColor: '#DCE3F2' },
  featureLabel: { fontFamily: fonts.medium, fontSize: 12.5, lineHeight: 16, color: '#3A4470', textAlign: 'center' },
  startWrap: { alignSelf: 'stretch', marginTop: 6 },
  start: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: SCENE_BLUE,
    borderRadius: 999,
    paddingVertical: 16,
  },
  startText: { fontFamily: fonts.bold, fontSize: 18, color: '#FFFFFF' },
  startArrow: { fontFamily: fonts.bold, fontSize: 20, color: '#FFFFFF' },
  footnote: { fontFamily: fonts.body, fontSize: 11.5, color: '#8890B5', textAlign: 'center', maxWidth: 320 },
});
