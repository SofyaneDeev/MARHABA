import { StyleSheet, Text } from 'react-native';

import { PressableScale } from '@/components/PressableScale';
import { useThemeColors } from '@/constants/theme';
import { useFavourites } from '@/lib/favourites';

/** ☆ / ★ toggle that saves an item to the Tools tab. */
export function StarButton({ id, label }: { id: string; label: string }) {
  const c = useThemeColors();
  const { isSaved, toggle } = useFavourites();
  const saved = isSaved(id);
  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityLabel={saved ? `Remove ${label} from saved` : `Save ${label}`}
      accessibilityState={{ selected: saved }}
      onPress={() => toggle(id)}
      scaleTo={0.75}
      hitSlop={8}
      style={styles.icon}>
      <Text style={[styles.glyph, { color: saved ? c.saffron : c.muted }]}>{saved ? '★' : '☆'}</Text>
    </PressableScale>
  );
}

/** A round button that reads a phrase aloud. */
export function SpeakButton({ label, onPress }: { label: string; onPress: () => void }) {
  const c = useThemeColors();
  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityLabel={`Listen: ${label}`}
      onPress={onPress}
      scaleTo={0.8}
      hitSlop={6}
      style={[styles.icon, styles.round, { backgroundColor: c.surfaceAlt }]}>
      <Text style={[styles.speaker, { color: c.primary }]}>🔊</Text>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  icon: { width: 34, height: 34, alignItems: 'center', justifyContent: 'center' },
  round: { borderRadius: 17 },
  glyph: { fontSize: 22, lineHeight: 26 },
  speaker: { fontSize: 15 },
});
