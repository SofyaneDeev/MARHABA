import type { ReactNode } from 'react';
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { PressableScale } from '@/components/PressableScale';
import { fonts, useThemeColors } from '@/constants/theme';

export function ScreenTitle({ title, lede }: { title: string; lede?: string }) {
  const c = useThemeColors();
  return (
    <View style={styles.titleBlock}>
      <Text style={[styles.title, { color: c.text }]}>{title}</Text>
      {lede ? <Text style={[styles.lede, { color: c.muted }]}>{lede}</Text> : null}
    </View>
  );
}

export function Card({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  const c = useThemeColors();
  return (
    <View style={[styles.card, { backgroundColor: c.surface, borderColor: c.line }, style]}>
      {children}
    </View>
  );
}

/** A thin rule between rows inside a Card. */
export function RowDivider() {
  const c = useThemeColors();
  return <View style={{ height: StyleSheet.hairlineWidth, backgroundColor: c.line }} />;
}

export function Chip({
  label,
  selected = false,
  onPress,
}: {
  label: string;
  selected?: boolean;
  onPress: () => void;
}) {
  const c = useThemeColors();
  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      scaleTo={0.92}
      style={[
        styles.chip,
        {
          backgroundColor: selected ? c.text : c.surface,
          borderColor: selected ? c.text : c.line,
        },
      ]}>
      <Text style={[styles.chipText, { color: selected ? c.surface : c.text }]}>{label}</Text>
    </PressableScale>
  );
}

export function SectionLabel({ children }: { children: string }) {
  const c = useThemeColors();
  return <Text style={[styles.sectionLabel, { color: c.muted }]}>{children.toUpperCase()}</Text>;
}

const styles = StyleSheet.create({
  titleBlock: { gap: 4 },
  title: { fontFamily: fonts.displaySemi, fontSize: 24 },
  lede: { fontFamily: fonts.body, fontSize: 14, lineHeight: 20 },
  card: { borderWidth: 1, borderRadius: 14, overflow: 'hidden' },
  chip: { borderWidth: 1, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 7 },
  chipText: { fontFamily: fonts.semibold, fontSize: 13 },
  sectionLabel: { fontFamily: fonts.bold, fontSize: 11, letterSpacing: 1.2 },
});
