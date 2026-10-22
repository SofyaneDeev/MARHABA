import { router } from 'expo-router';
import { useState } from 'react';
import { Linking, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { CalendarPicker } from '@/components/CalendarPicker';
import { PressableScale } from '@/components/PressableScale';
import { Card, Chip, RowDivider, ScreenTitle, SectionLabel } from '@/components/ui';
import { fonts, useThemeColors } from '@/constants/theme';
import {
  airlines,
  airports,
  googleFlightsUrl,
  kayakUrl,
  niceDate,
  origins,
  skyscannerUrl,
  todayIso,
  type Airport,
  type FlightSearch,
  type Origin,
} from '@/data/flights';
import { requestCity } from '@/lib/nav';

type DateField = 'depart' | 'ret';

/** First tab: where the traveller lands and when, then ready-made flight searches. */
export default function TripScreen() {
  const c = useThemeColors();
  const today = todayIso();
  const [to, setTo] = useState<Airport | null>(null);
  const [roundTrip, setRoundTrip] = useState(true);
  const [depart, setDepart] = useState<string | undefined>();
  const [ret, setRet] = useState<string | undefined>();
  const [editing, setEditing] = useState<DateField | null>('depart');
  const [origin, setOrigin] = useState<Origin | null>(null);
  const [otherFrom, setOtherFrom] = useState('');

  function chooseDate(day: string) {
    if (editing === 'ret') {
      setRet(day);
      setEditing(null);
      return;
    }
    setDepart(day);
    if (ret && ret < day) setRet(undefined);
    setEditing(roundTrip ? 'ret' : null);
  }

  const search: FlightSearch | null =
    to && depart && (!roundTrip || ret)
      ? { to, depart, ret: roundTrip ? ret : undefined, from: origin ?? (otherFrom.trim() || undefined) }
      : null;
  const links = search
    ? [
        { name: 'Google Flights', note: 'Compare airlines and prices', url: googleFlightsUrl(search) },
        { name: 'Skyscanner', note: 'Cheap flights and price alerts', url: skyscannerUrl(search) },
        { name: 'Kayak', note: 'Compare travel sites', url: kayakUrl(search) },
      ].filter((l): l is { name: string; note: string; url: string } => !!l.url)
    : [];

  function planTour() {
    if (to?.guideCity) requestCity(to.guideCity);
    router.navigate('/medina');
  }

  return (
    <ScrollView contentContainerStyle={styles.screen} keyboardShouldPersistTaps="handled">
      <ScreenTitle title="Plan your trip" lede="Choose the city you'll land in and your dates. We'll open flight searches for you." />

      {/* 1. Landing city */}
      <View style={styles.block}>
        <SectionLabel>1 · Where will you land?</SectionLabel>
        <View style={styles.wrap}>
          {airports.map((a) => (
            <Chip key={a.code} label={`${a.city} · ${a.code}`} selected={to?.code === a.code} onPress={() => setTo(a)} />
          ))}
        </View>
        {to ? (
          <Text style={[styles.hint, { color: c.muted }]}>
            {to.airport} airport ({to.code})
          </Text>
        ) : null}
      </View>

      {/* 2. Dates */}
      <View style={styles.block}>
        <SectionLabel>2 · When?</SectionLabel>
        <View style={styles.wrap}>
          <Chip label="Return trip" selected={roundTrip} onPress={() => setRoundTrip(true)} />
          <Chip
            label="One way"
            selected={!roundTrip}
            onPress={() => {
              setRoundTrip(false);
              setRet(undefined);
              if (editing === 'ret') setEditing(null);
            }}
          />
        </View>
        <View style={styles.dates}>
          <DateButton label="Arrival" value={depart} active={editing === 'depart'} onPress={() => setEditing(editing === 'depart' ? null : 'depart')} />
          {roundTrip ? (
            <DateButton label="Return" value={ret} active={editing === 'ret'} onPress={() => setEditing(editing === 'ret' ? null : 'ret')} />
          ) : null}
        </View>
        {editing ? (
          <CalendarPicker
            key={editing}
            min={editing === 'ret' && depart ? depart : today}
            value={editing === 'ret' ? ret : depart}
            rangeStart={editing === 'ret' ? depart : undefined}
            onChange={chooseDate}
          />
        ) : null}
      </View>

      {/* 3. Origin */}
      <View style={styles.block}>
        <SectionLabel>3 · Flying from (optional)</SectionLabel>
        <View style={styles.wrap}>
          {origins.map((o) => (
            <Chip
              key={o.code}
              label={o.city}
              selected={origin?.code === o.code}
              onPress={() => {
                setOrigin(origin?.code === o.code ? null : o);
                setOtherFrom('');
              }}
            />
          ))}
        </View>
        <TextInput
          value={otherFrom}
          onChangeText={(t) => {
            setOtherFrom(t);
            if (t) setOrigin(null);
          }}
          placeholder="Another city? Type it here"
          placeholderTextColor={c.muted}
          accessibilityLabel="Another city you fly from"
          style={[styles.input, { color: c.text, borderColor: c.line, backgroundColor: c.surface }]}
        />
      </View>

      {/* 4. Results */}
      {search ? (
        <View style={styles.block}>
          <SectionLabel>Your flights</SectionLabel>
          <Text style={[styles.summary, { color: c.text }]}>
            {search.from ? `${typeof search.from === 'string' ? search.from : search.from.city} → ` : 'To '}
            {search.to.city} ({search.to.code}) · {niceDate(search.depart)}
            {search.ret ? ` – ${niceDate(search.ret)}` : ''}
          </Text>
          <Card>
            {links.map((l, i) => (
              <View key={l.name}>
                {i > 0 ? <RowDivider /> : null}
                <LinkRow name={l.name} note={l.note} url={l.url} />
              </View>
            ))}
          </Card>
          {!origin ? (
            <Text style={[styles.hint, { color: c.muted }]}>Choose a city you fly from above to also search Skyscanner and Kayak.</Text>
          ) : null}
        </View>
      ) : (
        <Text style={[styles.hint, { color: c.muted }]}>Choose a city and your dates to see flights.</Text>
      )}

      <View style={styles.block}>
        <SectionLabel>Airlines flying to Morocco</SectionLabel>
        <Card>
          {airlines.map((a, i) => (
            <View key={a.name}>
              {i > 0 ? <RowDivider /> : null}
              <LinkRow name={a.name} note={a.note} url={a.url} />
            </View>
          ))}
        </Card>
      </View>

      <PressableScale accessibilityRole="button" onPress={planTour} style={[styles.tour, { backgroundColor: c.primary }]}>
        <Text style={[styles.tourText, { color: c.onPrimary }]}>
          {to?.guideCity ? `Plan my tour in ${to.guideCity} →` : 'Plan my tour →'}
        </Text>
      </PressableScale>
    </ScrollView>
  );
}

function DateButton({ label, value, active, onPress }: { label: string; value?: string; active: boolean; onPress: () => void }) {
  const c = useThemeColors();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${label}: ${value ? niceDate(value) : 'choose a date'}`}
      onPress={onPress}
      style={[styles.dateBtn, { borderColor: active ? c.primary : c.line, backgroundColor: c.surface }]}>
      <Text style={[styles.dateLabel, { color: c.muted }]}>{label.toUpperCase()}</Text>
      <Text style={[styles.dateValue, { color: value ? c.text : c.muted }]}>{value ? niceDate(value) : 'Choose a date'}</Text>
    </Pressable>
  );
}

function LinkRow({ name, note, url }: { name: string; note: string; url: string }) {
  const c = useThemeColors();
  return (
    <Pressable
      accessibilityRole="link"
      accessibilityLabel={`Open ${name}`}
      onPress={() => Linking.openURL(url).catch(() => {})}
      style={({ pressed }) => [styles.linkRow, pressed && { backgroundColor: c.surfaceAlt }]}>
      <View style={styles.flex}>
        <Text style={[styles.linkName, { color: c.text }]}>{name}</Text>
        <Text style={[styles.linkNote, { color: c.muted }]}>{note}</Text>
      </View>
      <Text style={[styles.linkArrow, { color: c.primary }]}>↗</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { padding: 16, gap: 22, paddingBottom: 32 },
  block: { gap: 10 },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  hint: { fontFamily: fonts.body, fontSize: 13, lineHeight: 18 },
  dates: { flexDirection: 'row', gap: 10 },
  dateBtn: { flex: 1, borderWidth: 1.5, borderRadius: 14, paddingHorizontal: 12, paddingVertical: 10, gap: 2 },
  dateLabel: { fontFamily: fonts.bold, fontSize: 11, letterSpacing: 1 },
  dateValue: { fontFamily: fonts.semibold, fontSize: 15 },
  input: { borderWidth: 1, borderRadius: 999, paddingHorizontal: 14, paddingVertical: 10, fontFamily: fonts.body, fontSize: 15 },
  summary: { fontFamily: fonts.semibold, fontSize: 15, lineHeight: 21 },
  linkRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 14, paddingVertical: 12 },
  flex: { flex: 1 },
  linkName: { fontFamily: fonts.semibold, fontSize: 15 },
  linkNote: { fontFamily: fonts.body, fontSize: 13 },
  linkArrow: { fontFamily: fonts.bold, fontSize: 18 },
  tour: { borderRadius: 999, paddingVertical: 15, alignItems: 'center' },
  tourText: { fontFamily: fonts.bold, fontSize: 16 },
});
