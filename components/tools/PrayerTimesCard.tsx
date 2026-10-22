import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { CityPicker } from '@/components/CityPicker';
import { Card } from '@/components/ui';
import { fonts, useThemeColors } from '@/constants/theme';
import { cityByName, useGuide } from '@/lib/guide';
import { formatMoroccoTime, MOROCCO_TIME_ZONE, nextPrayer, prayerLabels, prayerTimes } from '@/lib/prayer';

/** Today's prayer times for a city, with the next one highlighted. */
export function PrayerTimesCard() {
  const c = useThemeColors();
  const guide = useGuide();
  const [cityName, setCityName] = useState<string | null>(null);
  const city = cityByName(guide, cityName);
  const [now, setNow] = useState(() => new Date());

  // Refresh once a minute so "next" moves on by itself.
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(timer);
  }, []);

  const times = prayerTimes(city.lat, city.lng, now);
  const next = nextPrayer(times, now);
  const today = new Intl.DateTimeFormat('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    timeZone: MOROCCO_TIME_ZONE,
  }).format(now);

  return (
    <Card style={styles.card}>
      <Text style={[styles.title, { color: c.text }]}>Prayer times</Text>
      <Text style={[styles.body, { color: c.muted }]}>
        {today}, Moroccan time. Some shops and sights pause briefly around prayers, especially Friday midday.
      </Text>
      <CityPicker value={city} onChange={(c) => setCityName(c.name)} />

      <View style={[styles.table, { borderColor: c.line }]}>
        {times.map(({ name, time }) => {
          const isNext = name === next;
          return (
            <View
              key={name}
              style={[styles.row, { borderColor: c.line }, isNext && { backgroundColor: `${c.saffron}26` }]}
              accessibilityLabel={`${prayerLabels[name].en} at ${formatMoroccoTime(time)}${isNext ? ', next' : ''}`}>
              <Text style={[styles.name, { color: c.text }, isNext && styles.bold]}>{prayerLabels[name].en}</Text>
              <Text style={[styles.arabic, { color: c.muted }]}>{prayerLabels[name].ar}</Text>
              {isNext ? <Text style={[styles.nextTag, { color: c.clay }]}>NEXT</Text> : null}
              <Text style={[styles.time, { color: c.text }, isNext && styles.bold]}>{formatMoroccoTime(time)}</Text>
            </View>
          );
        })}
      </View>
      <Text style={[styles.small, { color: c.muted }]}>
        Calculated for {city.name} (Fajr 19°, Isha 17°). Local mosques may differ by a few minutes.
      </Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { padding: 14, gap: 10 },
  title: { fontFamily: fonts.bold, fontSize: 17 },
  body: { fontFamily: fonts.body, fontSize: 14, lineHeight: 20 },
  table: { borderWidth: 1, borderRadius: 10, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 12, paddingVertical: 9, borderTopWidth: StyleSheet.hairlineWidth },
  name: { fontFamily: fonts.medium, fontSize: 15, minWidth: 70 },
  arabic: { flex: 1, fontFamily: fonts.displaySemi, fontSize: 15 },
  nextTag: { fontFamily: fonts.bold, fontSize: 10.5, letterSpacing: 0.6 },
  time: { fontFamily: fonts.semibold, fontSize: 15, fontVariant: ['tabular-nums'] },
  bold: { fontFamily: fonts.bold },
  small: { fontFamily: fonts.body, fontSize: 12.5, lineHeight: 18 },
});
