import { Fragment, useEffect, useState } from 'react';
import { Platform, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { GlideIn } from '@/components/GlideIn';
import { SpeakButton, StarButton } from '@/components/IconButtons';
import { Card, Chip, RowDivider, ScreenTitle } from '@/components/ui';
import { fonts, useThemeColors } from '@/constants/theme';
import { filterPhrases, phraseCategories, type Phrase } from '@/data/phrases';
import { phraseId } from '@/lib/favourites';
import { findArabicVoice, speakArabic } from '@/lib/speech';

export default function PhrasesScreen() {
  const c = useThemeColors();
  const [category, setCategory] = useState('All');
  const [query, setQuery] = useState('');
  // undefined while checking, null when the device has no Arabic voice.
  const [voice, setVoice] = useState<string | null | undefined>(undefined);
  const results = filterPhrases(category, query);

  useEffect(() => {
    let cancelled = false;
    findArabicVoice().then((v) => {
      if (!cancelled) setVoice(v);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.screen} keyboardShouldPersistTaps="handled">
      <ScreenTitle
        title="Speak Darija"
        lede="Moroccan Arabic, written the way it sounds. Tap 🔊 to hear it, ☆ to save it."
      />
      <TextInput
        value={query}
        onChangeText={setQuery}
        placeholder="Search phrases, e.g. price, taxi, water"
        placeholderTextColor={c.muted}
        accessibilityLabel="Search phrases"
        style={[styles.search, { color: c.text, borderColor: c.line, backgroundColor: c.surface }]}
      />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
        {phraseCategories.map((cat) => (
          <Chip key={cat} label={cat} selected={cat === category} onPress={() => setCategory(cat)} />
        ))}
      </ScrollView>

      {results.length === 0 ? (
        <Text style={[styles.empty, { color: c.muted }]}>
          No phrase matches “{query.trim()}”. Try the Ask tab instead.
        </Text>
      ) : (
        // Re-keyed per category so the rows glide in again when it changes.
        <Card key={category}>
          {results.map((p, i) => (
            <Fragment key={p.darija}>
              {i > 0 ? <RowDivider /> : null}
              <GlideIn index={i}>
                <PhraseRow phrase={p} onSpeak={() => speakArabic(p.arabic, voice ?? null)} />
              </GlideIn>
            </Fragment>
          ))}
        </Card>
      )}

      <Text style={[styles.hint, { color: c.muted }]}>
        How to read it: “3” is a deep “a” sound from the throat, “kh” is like Scottish “loch”, “gh” is a soft
        French “r”.
      </Text>
      <Text style={[styles.hint, { color: c.muted }]}>
        {voice === null && Platform.OS !== 'web'
          ? 'No Arabic voice was found on this phone. Add one in your phone’s text-to-speech settings to hear phrases.'
          : 'Audio uses your device’s Arabic voice, so the accent is closer to standard Arabic than to Darija.'}
      </Text>
    </ScrollView>
  );
}

function PhraseRow({ phrase, onSpeak }: { phrase: Phrase; onSpeak: () => void }) {
  const c = useThemeColors();
  return (
    <View style={styles.row}>
      <View style={styles.rowTop}>
        <View style={styles.rowText}>
          <Text style={[styles.english, { color: c.muted }]}>{phrase.english}</Text>
          <Text style={[styles.darija, { color: c.text }]}>{phrase.darija}</Text>
        </View>
        <Text style={[styles.arabic, { color: c.primary }]}>{phrase.arabic}</Text>
      </View>
      {phrase.tip ? <Text style={[styles.tip, { color: c.muted }]}>{phrase.tip}</Text> : null}
      <View style={styles.actions}>
        <SpeakButton label={phrase.darija} onPress={onSpeak} />
        <StarButton id={phraseId(phrase)} label={phrase.darija} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { padding: 16, gap: 14 },
  search: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, fontFamily: fonts.body, fontSize: 15 },
  chips: { gap: 6 },
  empty: { textAlign: 'center', padding: 24, fontFamily: fonts.body },
  row: { paddingHorizontal: 14, paddingTop: 12, paddingBottom: 6, gap: 4 },
  rowTop: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  rowText: { flex: 1, minWidth: 0 },
  english: { fontFamily: fonts.body, fontSize: 13 },
  darija: { fontFamily: fonts.bold, fontSize: 17 },
  arabic: { fontFamily: fonts.displaySemi, fontSize: 18, writingDirection: 'rtl', textAlign: 'right', flexShrink: 1 },
  tip: { fontFamily: fonts.body, fontSize: 12.5, lineHeight: 17 },
  actions: { flexDirection: 'row', gap: 4, marginLeft: -4 },
  hint: { fontFamily: fonts.body, fontSize: 12.5, lineHeight: 18 },
});
