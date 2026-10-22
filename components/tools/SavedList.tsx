import { Fragment } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { StarButton } from '@/components/IconButtons';
import { Card, RowDivider } from '@/components/ui';
import { fonts, useThemeColors } from '@/constants/theme';
import type { City } from '@/data/cities';
import { phrases } from '@/data/phrases';
import { phraseId, placeId, useFavourites } from '@/lib/favourites';
import { useGuide } from '@/lib/guide';

type SavedItem =
  | { kind: 'phrase'; id: string; title: string; detail: string; arabic: string }
  | { kind: 'place'; id: string; title: string; detail: string };

/** Looks up saved ids in the app's own data, skipping any that no longer exist. */
function resolve(ids: string[], cities: City[]): SavedItem[] {
  const byId = new Map<string, SavedItem>();
  for (const p of phrases) {
    byId.set(phraseId(p), { kind: 'phrase', id: phraseId(p), title: p.darija, detail: p.english, arabic: p.arabic });
  }
  for (const city of cities) {
    for (const place of city.places) {
      const id = placeId(city, place);
      byId.set(id, { kind: 'place', id, title: place.name, detail: city.name });
    }
  }
  return ids.flatMap((id) => byId.get(id) ?? []);
}

/** Phrases and places the traveller starred, available offline. */
export function SavedList() {
  const c = useThemeColors();
  const { ids } = useFavourites();
  const { cities } = useGuide();
  const items = resolve(ids, cities);

  return (
    <Card style={styles.card}>
      <Text style={[styles.title, { color: c.text }]}>Saved</Text>
      {items.length === 0 ? (
        <Text style={[styles.body, { color: c.muted }]}>
          Tap ☆ on a phrase or a place to keep it here. Saved items work without internet.
        </Text>
      ) : (
        <View>
          {items.map((item, i) => (
            <Fragment key={item.id}>
              {i > 0 ? <RowDivider /> : null}
              <View style={styles.row}>
                <Text style={styles.kind}>{item.kind === 'phrase' ? '💬' : '📍'}</Text>
                <View style={styles.text}>
                  <Text style={[styles.itemTitle, { color: c.text }]}>{item.title}</Text>
                  <Text style={[styles.body, { color: c.muted }]}>{item.detail}</Text>
                </View>
                {item.kind === 'phrase' ? (
                  <Text style={[styles.arabic, { color: c.primary }]}>{item.arabic}</Text>
                ) : null}
                <StarButton id={item.id} label={item.title} />
              </View>
            </Fragment>
          ))}
        </View>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { padding: 14, gap: 8 },
  title: { fontFamily: fonts.bold, fontSize: 17 },
  body: { fontFamily: fonts.body, fontSize: 13.5, lineHeight: 19 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8 },
  kind: { fontSize: 16 },
  text: { flex: 1, minWidth: 0 },
  itemTitle: { fontFamily: fonts.semibold, fontSize: 15 },
  arabic: { fontFamily: fonts.displaySemi, fontSize: 16, flexShrink: 1, textAlign: 'right' },
});
