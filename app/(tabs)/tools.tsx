import { router } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { GlideIn } from '@/components/GlideIn';
import { PressableScale } from '@/components/PressableScale';
import { CurrencyConverter } from '@/components/tools/CurrencyConverter';
import { PrayerTimesCard } from '@/components/tools/PrayerTimesCard';
import { SavedList } from '@/components/tools/SavedList';
import { ScreenTitle } from '@/components/ui';
import { fonts, useThemeColors } from '@/constants/theme';

export default function ToolsScreen() {
  const c = useThemeColors();

  return (
    <ScrollView contentContainerStyle={styles.screen} keyboardShouldPersistTaps="handled">
      <ScreenTitle title="Travel tools" lede="Everyday helpers for your trip, most of them working offline." />

      <GlideIn index={0}>
        <PressableScale
          accessibilityRole="button"
          accessibilityLabel="Emergency help: police 19, ambulance 15, mobile 112"
          onPress={() => router.push('/sos')}
          scaleTo={0.97}
          style={[styles.sos, { backgroundColor: c.danger }]}>
          <Text style={styles.sosBadge}>SOS</Text>
          <View style={styles.sosText}>
            <Text style={styles.sosTitle}>Emergency help</Text>
            <Text style={styles.sosBody}>Police 19 · Ambulance 15 · Mobile 112</Text>
          </View>
          <Text style={styles.sosArrow}>›</Text>
        </PressableScale>
      </GlideIn>

      <GlideIn index={1}>
        <CurrencyConverter />
      </GlideIn>
      <GlideIn index={2}>
        <PrayerTimesCard />
      </GlideIn>
      <GlideIn index={3}>
        <SavedList />
      </GlideIn>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { padding: 16, gap: 14 },
  sos: { flexDirection: 'row', alignItems: 'center', gap: 14, borderRadius: 14, padding: 14 },
  sosBadge: { fontFamily: fonts.display, fontSize: 22, color: '#FFFFFF' },
  sosText: { flex: 1, minWidth: 0 },
  sosTitle: { fontFamily: fonts.bold, fontSize: 16, color: '#FFFFFF' },
  sosBody: { fontFamily: fonts.body, fontSize: 13, color: 'rgba(255,255,255,0.9)' },
  sosArrow: { fontFamily: fonts.bold, fontSize: 28, color: '#FFFFFF' },
});
