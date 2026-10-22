import * as Clipboard from 'expo-clipboard';
import { Fragment, useEffect, useState } from 'react';
import { Linking, ScrollView, StyleSheet, Text, View } from 'react-native';

import { GlideIn } from '@/components/GlideIn';
import { PressableScale } from '@/components/PressableScale';
import { Card, RowDivider, ScreenTitle, SectionLabel } from '@/components/ui';
import { fonts, useThemeColors } from '@/constants/theme';
import { emergencyNumbers, emergencyTips, type EmergencyNumber } from '@/data/emergency';

export default function SosScreen() {
  const c = useThemeColors();

  return (
    <ScrollView style={{ backgroundColor: c.background }} contentContainerStyle={styles.screen}>
      <ScreenTitle title="Emergency help" lede="Free numbers that work from any Moroccan or foreign phone." />

      <View style={styles.grid}>
        {emergencyNumbers.map((n, i) => (
          <GlideIn key={n.number} index={i} style={styles.cardWrap}>
            <NumberCard item={n} />
          </GlideIn>
        ))}
      </View>

      <SectionLabel>Good to know</SectionLabel>
      <Card>
        {emergencyTips.map((tip, i) => (
          <Fragment key={tip.title}>
            {i > 0 ? <RowDivider /> : null}
            <View style={styles.tip}>
              <Text style={[styles.tipTitle, { color: c.text }]}>{tip.title}</Text>
              <Text style={[styles.tipText, { color: c.muted }]}>{tip.text}</Text>
            </View>
          </Fragment>
        ))}
      </Card>
    </ScrollView>
  );
}

function NumberCard({ item }: { item: EmergencyNumber }) {
  const c = useThemeColors();
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 1500);
    return () => clearTimeout(t);
  }, [copied]);

  async function copy() {
    await Clipboard.setStringAsync(item.number);
    setCopied(true);
  }

  return (
    <View
      style={[
        styles.card,
        item.primary
          ? { backgroundColor: c.dangerSoft, borderColor: `${c.danger}66` }
          : { backgroundColor: c.surface, borderColor: c.line },
      ]}>
      <Text style={[styles.number, { color: c.danger }]}>{item.number}</Text>
      <Text style={[styles.service, { color: c.text }]}>{item.service}</Text>
      <Text style={[styles.when, { color: c.muted }]}>{item.when}</Text>
      <View style={styles.actions}>
        <PressableScale
          accessibilityRole="button"
          accessibilityLabel={`Call ${item.number}`}
          onPress={() => Linking.openURL(`tel:${item.number}`).catch(() => {})}
          style={[styles.call, { backgroundColor: c.primary }]}>
          <Text style={[styles.callText, { color: c.onPrimary }]}>Call</Text>
        </PressableScale>
        <PressableScale
          accessibilityRole="button"
          accessibilityLabel={`Copy ${item.number}`}
          onPress={copy}
          style={[styles.copy, { borderColor: c.line }]}>
          <Text style={[styles.copyText, { color: c.text }]}>{copied ? 'Copied' : 'Copy'}</Text>
        </PressableScale>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { padding: 16, gap: 14 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  cardWrap: { flexGrow: 1, flexBasis: 150 },
  card: { flexGrow: 1, borderWidth: 1, borderRadius: 14, padding: 14, gap: 4 },
  number: { fontFamily: fonts.display, fontSize: 34, lineHeight: 40 },
  service: { fontFamily: fonts.semibold, fontSize: 14 },
  when: { fontFamily: fonts.body, fontSize: 12.5 },
  actions: { flexDirection: 'row', gap: 6, marginTop: 6 },
  call: { flex: 1, borderRadius: 999, paddingVertical: 8, alignItems: 'center' },
  callText: { fontFamily: fonts.semibold, fontSize: 13 },
  copy: { borderWidth: 1, borderRadius: 999, paddingVertical: 8, paddingHorizontal: 12, alignItems: 'center' },
  copyText: { fontFamily: fonts.semibold, fontSize: 13 },
  tip: { paddingHorizontal: 14, paddingVertical: 10, gap: 2 },
  tipTitle: { fontFamily: fonts.bold, fontSize: 14 },
  tipText: { fontFamily: fonts.body, fontSize: 14, lineHeight: 20 },
});
