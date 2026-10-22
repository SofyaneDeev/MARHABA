import { SymbolView, type SymbolViewProps } from 'expo-symbols';
import { StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PressableScale } from '@/components/PressableScale';
import { DriftingZellige } from '@/components/Zellige';
import { fonts } from '@/constants/theme';
import type { StartChoice } from '@/lib/nav';

const BLUE = '#0C45C5';
const WHITE = '#F6FAFD';
const INK = '#1534A6';

const CHOICES: { id: StartChoice; title: string; text: string; icon: SymbolViewProps['name'] }[] = [
  {
    id: 'trip',
    title: 'Plan my trip',
    text: "Choose the city you'll land in and your dates, and find flights.",
    icon: { ios: 'airplane', android: 'flight', web: 'flight' },
  },
  {
    id: 'tour',
    title: 'Plan my tour',
    text: "Already coming? Explore the cities, what to see and when to go.",
    icon: { ios: 'map.fill', android: 'map', web: 'map' },
  },
];

/** Shown after "Get Started": does the traveller want flights first, or to explore the cities? */
export function StartChoiceScreen({ onChoose }: { onChoose: (choice: StartChoice) => void }) {
  const insets = useSafeAreaInsets();
  const { width: windowWidth } = useWindowDimensions();
  const width = Math.min(windowWidth, 480);

  return (
    <View style={styles.root}>
      <View style={[styles.band, { paddingTop: insets.top + 28 }]}>
        <DriftingZellige id="choice-zellige" />
        <Animated.Text entering={FadeInDown.duration(450)} style={styles.title}>
          Where do we start?
        </Animated.Text>
        <Animated.Text entering={FadeInDown.delay(120).duration(450)} style={styles.sub}>
          You can always switch later from the tabs at the bottom.
        </Animated.Text>
      </View>
      <View style={[styles.cards, { width, paddingBottom: insets.bottom + 20 }]}>
        {CHOICES.map((ch, i) => (
          <Animated.View key={ch.id} entering={FadeInUp.delay(200 + i * 140).duration(500)}>
            <PressableScale
              accessibilityRole="button"
              accessibilityLabel={ch.title}
              onPress={() => onChoose(ch.id)}
              style={styles.card}>
              <View style={styles.icon}>
                <SymbolView name={ch.icon} tintColor="#FFFFFF" size={30} />
              </View>
              <View style={styles.cardText}>
                <Text style={styles.cardTitle}>{ch.title}</Text>
                <Text style={styles.cardBody}>{ch.text}</Text>
              </View>
              <Text style={styles.arrow}>→</Text>
            </PressableScale>
          </Animated.View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: WHITE, alignItems: 'center' },
  band: { alignSelf: 'stretch', backgroundColor: BLUE, alignItems: 'center', paddingBottom: 28, paddingHorizontal: 24, overflow: 'hidden', gap: 6 },
  title: { fontFamily: fonts.display, fontSize: 32, lineHeight: 42, color: '#FFFFFF', textAlign: 'center' },
  sub: { fontFamily: fonts.body, fontSize: 14, color: 'rgba(255,255,255,0.85)', textAlign: 'center' },
  cards: { flex: 1, justifyContent: 'center', paddingHorizontal: 20, gap: 16 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#DCE3F2',
    padding: 18,
    shadowColor: '#0C2A80',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  icon: { width: 56, height: 56, borderRadius: 16, backgroundColor: BLUE, alignItems: 'center', justifyContent: 'center' },
  cardText: { flex: 1, gap: 4 },
  cardTitle: { fontFamily: fonts.bold, fontSize: 19, color: INK },
  cardBody: { fontFamily: fonts.body, fontSize: 14, lineHeight: 19, color: '#4A5585' },
  arrow: { fontFamily: fonts.bold, fontSize: 22, color: BLUE },
});
