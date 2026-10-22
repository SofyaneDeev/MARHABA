import { SymbolView } from 'expo-symbols';
import { Fragment, useState } from 'react';
import { Linking, ScrollView, StyleSheet, Text, View } from 'react-native';

import { CityPicker } from '@/components/CityPicker';
import { ExperienceList } from '@/components/ExperienceList';
import { GlideIn } from '@/components/GlideIn';
import { LogoTile } from '@/components/LogoTile';
import { PressableScale } from '@/components/PressableScale';
import { Card, RowDivider, SectionLabel } from '@/components/ui';
import { ZelligePattern } from '@/components/Zellige';
import { GUIDE_REQUESTS_ENABLED } from '@/constants/features';
import { fonts, palette, useThemeColors } from '@/constants/theme';
import { bookingCategories, type BookingCategory, type BookingOption, type CategoryId } from '@/data/booking';
import type { City } from '@/data/cities';
import { providers } from '@/data/providers';
import { cityByName, useGuide } from '@/lib/guide';

export default function BookScreen() {
  const c = useThemeColors();
  const guide = useGuide();
  const [cityName, setCityName] = useState<string | null>(null);
  const city = cityByName(guide, cityName);
  const categories = bookingCategories(city);
  const [categoryId, setCategoryId] = useState<CategoryId>('stay');
  const category = categories.find((x) => x.id === categoryId) ?? categories[0];

  return (
    <ScrollView contentContainerStyle={styles.screen}>
      <CityBanner city={city} />
      <CityPicker value={city} onChange={(next) => setCityName(next.name)} />

      {GUIDE_REQUESTS_ENABLED ? (
        <>
          <SectionLabel>{`Local guides & experiences in ${city.name}`}</SectionLabel>
          <ExperienceList key={city.name} city={city.name} />
        </>
      ) : null}

      <SectionLabel>What do you need?</SectionLabel>
      <View style={styles.grid} accessibilityRole="tablist">
        {categories.map((cat) => (
          <CategoryTile key={cat.id} category={cat} selected={cat.id === category.id} onPress={() => setCategoryId(cat.id)} />
        ))}
      </View>

      {/* Re-keyed so the panel glides in again when the category or city changes. */}
      <GlideIn key={`${category.id}-${city.name}`}>
        <CategoryPanel category={category} />
      </GlideIn>

      <Text style={[styles.note, { color: c.muted }]}>
        You book and pay on each company’s own site or app, so check reviews and the cancellation policy first. Which
        apps work changes from city to city. Marhaba isn’t partnered with these companies.
      </Text>
    </ScrollView>
  );
}

/** The destination header, in Majorelle blue with a zellige lattice. */
function CityBanner({ city }: { city: City }) {
  return (
    <View style={styles.banner}>
      <ZelligePattern id="book-banner" opacity={0.12} size={40} />
      <Text style={styles.bannerKicker}>PLAN YOUR TRIP TO</Text>
      <Text style={styles.bannerCity}>{city.name}</Text>
      <Text style={styles.bannerLine}>{city.knownFor}</Text>
    </View>
  );
}

function CategoryTile({ category, selected, onPress }: { category: BookingCategory; selected: boolean; onPress: () => void }) {
  const c = useThemeColors();
  return (
    <View style={styles.tileCell}>
      <PressableScale
        accessibilityRole="tab"
        accessibilityState={{ selected }}
        accessibilityLabel={category.label}
        onPress={onPress}
        scaleTo={0.9}
        style={styles.tile}>
        <View
          style={[
            styles.tileIcon,
            selected ? { backgroundColor: c.primary } : { backgroundColor: c.surface, borderColor: c.line, borderWidth: 1 },
          ]}>
          <SymbolView name={category.icon} tintColor={selected ? c.onPrimary : c.primary} size={26} />
        </View>
        <Text style={[styles.tileLabel, { color: selected ? c.primary : c.text }, selected && styles.tileLabelOn]} numberOfLines={2}>
          {category.label}
        </Text>
      </PressableScale>
    </View>
  );
}

function CategoryPanel({ category }: { category: BookingCategory }) {
  const c = useThemeColors();
  return (
    <Card style={styles.panel}>
      <View style={styles.panelHead}>
        <Text style={[styles.panelTitle, { color: c.text }]}>{category.title}</Text>
        <Text style={[styles.body, { color: c.muted }]}>{category.description}</Text>
      </View>
      <View>
        {category.options.map((option, i) => (
          <Fragment key={`${option.provider}-${option.title}`}>
            {i > 0 ? <RowDivider /> : null}
            <GlideIn index={i}>
              <OptionRow option={option} />
            </GlideIn>
          </Fragment>
        ))}
      </View>
      <View style={[styles.tip, { backgroundColor: c.surfaceAlt }]}>
        <Text style={[styles.tipText, { color: c.text }]}>
          <Text style={styles.tipLabel}>Good to know: </Text>
          {category.tip}
        </Text>
      </View>
    </Card>
  );
}

function OptionRow({ option }: { option: BookingOption }) {
  const c = useThemeColors();
  const providerName = providers[option.provider].name;
  // "Cooking classes" comes from GetYourGuide: say so. "Booking.com" needs no "on Booking.com".
  const via = option.title === providerName ? null : `on ${providerName}`;
  return (
    <PressableScale
      accessibilityRole="link"
      accessibilityLabel={`Open ${option.title}${via ? ` ${via}` : ''}`}
      onPress={() => Linking.openURL(option.url).catch(() => {})}
      scaleTo={0.98}
      style={styles.option}>
      <LogoTile provider={option.provider} size={50} />
      <View style={styles.optionText}>
        <Text style={[styles.optionTitle, { color: c.text }]}>{option.title}</Text>
        <Text style={[styles.optionSub, { color: c.muted }]} numberOfLines={3}>
          {option.subtitle}
        </Text>
        {via ? <Text style={[styles.via, { color: c.primary }]}>{via}</Text> : null}
      </View>
      <View style={[styles.go, { backgroundColor: c.surfaceAlt }]}>
        <Text style={[styles.goText, { color: c.primary }]}>↗</Text>
      </View>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  screen: { padding: 16, gap: 14 },
  banner: {
    backgroundColor: palette.majorelle,
    borderRadius: 20,
    padding: 20,
    paddingTop: 18,
    overflow: 'hidden',
    gap: 2,
  },
  bannerKicker: { fontFamily: fonts.bold, fontSize: 11, letterSpacing: 1.4, color: palette.saffron },
  bannerCity: { fontFamily: fonts.display, fontSize: 34, lineHeight: 42, color: '#FFFFFF' },
  bannerLine: { fontFamily: fonts.body, fontSize: 14, color: 'rgba(255,255,255,0.88)' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -4 },
  tileCell: { width: '25%', paddingHorizontal: 4, paddingBottom: 10 },
  tile: { alignItems: 'center', gap: 6 },
  tileIcon: { width: 58, height: 58, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  tileLabel: { fontFamily: fonts.medium, fontSize: 12, textAlign: 'center' },
  tileLabelOn: { fontFamily: fonts.bold },
  panel: { padding: 16, gap: 10 },
  panelHead: { gap: 2 },
  panelTitle: { fontFamily: fonts.displaySemi, fontSize: 20 },
  body: { fontFamily: fonts.body, fontSize: 14, lineHeight: 20 },
  option: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 },
  optionText: { flex: 1, minWidth: 0, gap: 1 },
  optionTitle: { fontFamily: fonts.bold, fontSize: 16 },
  optionSub: { fontFamily: fonts.body, fontSize: 13.5, lineHeight: 19 },
  via: { fontFamily: fonts.semibold, fontSize: 12 },
  go: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  goText: { fontFamily: fonts.bold, fontSize: 17 },
  tip: { borderRadius: 12, padding: 12 },
  tipText: { fontFamily: fonts.body, fontSize: 13, lineHeight: 18 },
  tipLabel: { fontFamily: fonts.bold },
  note: { fontFamily: fonts.body, fontSize: 12.5, lineHeight: 18 },
});
