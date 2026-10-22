import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { GlideIn } from '@/components/GlideIn';
import { Lantern } from '@/components/Lantern';
import { PressableScale } from '@/components/PressableScale';
import { Card } from '@/components/ui';
import { fonts, useThemeColors } from '@/constants/theme';
import { BookingError, categoryLabel, fetchExperiences, type Experience } from '@/lib/bookings';

type State =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; items: Experience[] };

/** Bookable experiences for one city, loaded from Supabase. Give it `key={city}` so it reloads per city. */
export function ExperienceList({ city }: { city: string }) {
  const c = useThemeColors();
  const [state, setState] = useState<State>({ status: 'loading' });
  // Bumped by "Try again" to load once more.
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    fetchExperiences(city)
      .then((items) => {
        if (!cancelled) setState({ status: 'ready', items });
      })
      .catch((e) => {
        if (!cancelled) {
          setState({ status: 'error', message: e instanceof BookingError ? e.message : 'Something went wrong.' });
        }
      });
    return () => {
      cancelled = true;
    };
  }, [city, attempt]);

  if (state.status === 'loading') {
    return (
      <Lantern label="Finding local guides…" />
    );
  }

  if (state.status === 'error') {
    return (
      <View style={[styles.notice, { borderColor: c.line, backgroundColor: c.surface }]}>
        <Text style={[styles.body, { color: c.text }]}>{state.message}</Text>
        <Pressable
          accessibilityRole="button"
          onPress={() => {
            setState({ status: 'loading' });
            setAttempt((n) => n + 1);
          }}>
          <Text style={[styles.retry, { color: c.primary }]}>Try again</Text>
        </Pressable>
      </View>
    );
  }

  if (state.items.length === 0) {
    return (
      <View style={[styles.notice, { borderColor: c.line, backgroundColor: c.surface }]}>
        <Text style={[styles.body, { color: c.muted }]}>
          No guides are listed in {city} yet. Use the partner sites below.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.list}>
      {state.items.map((item, i) => (
        <GlideIn key={item.id} index={i}>
          <ExperienceCard item={item} />
        </GlideIn>
      ))}
    </View>
  );
}

function ExperienceCard({ item }: { item: Experience }) {
  const c = useThemeColors();
  const facts = [item.duration, item.price_from_mad != null ? `from ${item.price_from_mad} MAD` : null]
    .filter(Boolean)
    .join(' · ');

  return (
    <Card style={styles.card}>
      <View style={styles.badges}>
        <Badge label={categoryLabel[item.category]} color={c.primary} />
        {item.licensed ? <Badge label="Licensed guide" color={c.mint} /> : null}
        {item.is_sample ? <Badge label="Sample" color={c.clay} /> : null}
      </View>
      <Text style={[styles.title, { color: c.text }]}>{item.title}</Text>
      {facts ? <Text style={[styles.facts, { color: c.text }]}>{facts}</Text> : null}
      <Text style={[styles.body, { color: c.muted }]}>{item.description}</Text>
      {item.guide_name ? <Text style={[styles.body, { color: c.muted }]}>Guide: {item.guide_name}</Text> : null}
      <PressableScale
        accessibilityRole="button"
        accessibilityLabel={`Request to book: ${item.title}`}
        onPress={() => router.push({ pathname: '/request/[id]', params: { id: item.id } })}
        style={[styles.cta, { backgroundColor: c.primary }]}>
        <Text style={[styles.ctaText, { color: c.onPrimary }]}>Request to book</Text>
      </PressableScale>
    </Card>
  );
}

function Badge({ label, color }: { label: string; color: string }) {
  return (
    <View style={[styles.badge, { backgroundColor: `${color}22` }]}>
      <Text style={[styles.badgeText, { color }]}>{label.toUpperCase()}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  list: { gap: 12 },
  notice: { borderWidth: 1, borderRadius: 12, padding: 14, gap: 6 },
  retry: { fontFamily: fonts.semibold, fontSize: 14 },
  card: { padding: 14, gap: 6 },
  badges: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  badge: { borderRadius: 999, paddingHorizontal: 8, paddingVertical: 2 },
  badgeText: { fontFamily: fonts.bold, fontSize: 10.5, letterSpacing: 0.5 },
  title: { fontFamily: fonts.bold, fontSize: 17 },
  facts: { fontFamily: fonts.semibold, fontSize: 13.5 },
  body: { fontFamily: fonts.body, fontSize: 14, lineHeight: 20 },
  cta: { borderRadius: 999, paddingVertical: 11, alignItems: 'center', marginTop: 4 },
  ctaText: { fontFamily: fonts.bold, fontSize: 15 },
});
