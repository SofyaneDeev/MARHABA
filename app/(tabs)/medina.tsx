import { Fragment, useState } from 'react';
import { Linking, ScrollView, StyleSheet, Text, View } from 'react-native';

import { CityPicker } from '@/components/CityPicker';
import { GlideIn } from '@/components/GlideIn';
import { StarButton } from '@/components/IconButtons';
import { PressableScale } from '@/components/PressableScale';
import { Card, Chip, RowDivider, ScreenTitle } from '@/components/ui';
import { fonts, useThemeColors, type ThemeColors } from '@/constants/theme';
import {
  mapsSearchUrl,
  mapsUrl,
  placeKindLabel,
  placeSectionTitle,
  sectionOf,
  type City,
  type Place,
  type PlaceKind,
  type PlaceSection,
} from '@/data/cities';
import { parkKindLabel, type Park } from '@/data/parks';
import { seasonOf } from '@/data/seasons';
import { placeId } from '@/lib/favourites';
import { cityByName, useGuide, type Guide } from '@/lib/guide';
import { useCityRequest } from '@/lib/nav';

type View3 = 'cities' | 'seasons' | 'parks';
const VIEWS: { id: View3; label: string }[] = [
  { id: 'cities', label: 'Cities' },
  { id: 'seasons', label: 'Seasons' },
  { id: 'parks', label: 'Parks & nature' },
];

export default function CitiesScreen() {
  const guide = useGuide();
  const [view, setView] = useState<View3>('cities');
  // Kept by name, so the page follows the guide when a newer version loads.
  const [cityName, setCityName] = useState<string | null>(null);
  const city = cityByName(guide, cityName);

  // The trip planner can ask for a city ("Plan my tour in Marrakech").
  // React's pattern for following a changing value: update while rendering, once per new request.
  const request = useCityRequest();
  const [handled, setHandled] = useState(request);
  if (request !== handled) {
    setHandled(request);
    if (request.city) {
      setCityName(request.city);
      setView('cities');
    }
  }

  function openCity(c: City) {
    setCityName(c.name);
    setView('cities');
  }

  return (
    <ScrollView contentContainerStyle={styles.screen}>
      <ScreenTitle
        title="Explore Morocco"
        lede={`${guide.cities.length} cities with landmarks, gardens, nature and evenings out, plus the best season to go.`}
      />
      <View style={styles.views} accessibilityRole="tablist">
        {VIEWS.map((v) => (
          <Chip key={v.id} label={v.label} selected={view === v.id} onPress={() => setView(v.id)} />
        ))}
      </View>

      {view === 'cities' ? <CityView city={city} onChange={(c) => setCityName(c.name)} /> : null}
      {view === 'seasons' ? <SeasonsView onOpenCity={openCity} /> : null}
      {view === 'parks' ? <ParksView /> : null}

      <GuideStatus guide={guide} />
    </ScrollView>
  );
}

/* ---------- One city ---------- */

const SECTION_ORDER: PlaceSection[] = ['landmarks', 'gardens', 'nature', 'nightlife'];

function CityView({ city, onChange }: { city: City; onChange: (c: City) => void }) {
  const c = useThemeColors();
  const sections = SECTION_ORDER.map((id) => ({
    id,
    places: city.places.filter((p) => sectionOf(p.kind) === id),
  })).filter((s) => s.places.length > 0 || (s.id === 'nightlife' && city.nightlifeTip));

  return (
    <>
      <CityPicker value={city} onChange={onChange} />

      <View style={styles.cityHeading}>
        <Text style={[styles.cityName, { color: c.text }]}>{city.name}</Text>
        <Text style={[styles.body, { color: c.muted }]}>{city.knownFor}</Text>
        <View style={[styles.seasonPill, { backgroundColor: c.surfaceAlt }]}>
          <Text style={[styles.seasonPillText, { color: c.text }]}>🗓 Best time: {city.bestSeason}</Text>
        </View>
      </View>

      <View style={[styles.callout, { backgroundColor: c.surface, borderColor: c.line, borderLeftColor: c.saffron }]}>
        <Text style={[styles.calloutTitle, { color: c.text }]}>{city.tipTitle}</Text>
        <Text style={[styles.body, { color: c.text }]}>{city.tipText}</Text>
      </View>

      {/* Re-keyed per city so the places glide in again when it changes. */}
      <View key={city.name} style={styles.sections}>
        {sections.map((section, si) => (
          <GlideIn key={section.id} index={si}>
            <Text style={[styles.sectionTitle, { color: c.text }]}>{placeSectionTitle[section.id]}</Text>
            {section.id === 'nightlife' ? (
              <Text style={[styles.note, { color: c.muted }]}>
                {city.nightlifeTip ? `${city.nightlifeTip} ` : ''}Venues change often, so check opening times on Maps before
                you go.
              </Text>
            ) : null}
            {section.places.length > 0 ? (
              <Card>
                {section.places.map((place, i) => (
                  <Fragment key={place.name}>
                    {i > 0 ? <RowDivider /> : null}
                    <PlaceRow place={place} city={city} />
                  </Fragment>
                ))}
              </Card>
            ) : null}
          </GlideIn>
        ))}
      </View>

      <Text style={[styles.note, { color: c.muted }]}>
        Offline maps with step-by-step medina routes are coming in a later version.
      </Text>
    </>
  );
}

function tagColor(kind: PlaceKind, c: ThemeColors): string {
  switch (kind) {
    case 'gate':
      return c.muted;
    case 'sight':
      return c.primary;
    case 'square':
      return c.saffron;
    case 'market':
      return c.clay;
    case 'garden':
      return c.mint;
    case 'nature':
      return c.leaf;
    case 'nightlife':
      return c.night;
  }
}

function Tag({ label, color }: { label: string; color: string }) {
  return (
    <View style={[styles.tag, { backgroundColor: `${color}26` }]}>
      <Text style={[styles.tagText, { color }]}>{label.toUpperCase()}</Text>
    </View>
  );
}

function MapsLink({ url }: { url: string }) {
  const c = useThemeColors();
  return (
    <PressableScale
      accessibilityRole="link"
      onPress={() => Linking.openURL(url).catch(() => {})}
      haptic={false}
      style={styles.mapsLink}>
      <Text style={[styles.mapsText, { color: c.primary }]}>Open in Maps ↗</Text>
    </PressableScale>
  );
}

function PlaceRow({ place, city }: { place: Place; city: City }) {
  const c = useThemeColors();
  return (
    <View style={styles.place}>
      <View style={styles.placeTop}>
        <Text style={[styles.placeName, { color: c.text }]}>{place.name}</Text>
        <Tag label={placeKindLabel[place.kind]} color={tagColor(place.kind, c)} />
        <StarButton id={placeId(city, place)} label={place.name} />
      </View>
      <Text style={[styles.body, { color: c.muted }]}>{place.description}</Text>
      <MapsLink url={mapsUrl(place, city)} />
    </View>
  );
}

/* ---------- Seasons ---------- */

function SeasonsView({ onOpenCity }: { onOpenCity: (c: City) => void }) {
  const c = useThemeColors();
  const { cities, seasons: seasonGuides } = useGuide();
  const current = seasonOf(new Date());
  const [season, setSeason] = useState(current);
  const guide = seasonGuides.find((g) => g.season === season) ?? seasonGuides[0];
  const currentLabel = (seasonGuides.find((g) => g.season === current) ?? guide).label.toLowerCase();

  return (
    <>
      <Text style={[styles.body, { color: c.muted }]}>
        Where to go, season by season. It’s {currentLabel} in Morocco now.
      </Text>
      <View style={styles.chipRow}>
        {seasonGuides.map((g) => (
          <Chip key={g.season} label={g.label} selected={g.season === season} onPress={() => setSeason(g.season)} />
        ))}
      </View>

      <GlideIn key={season}>
        <Card style={styles.seasonCard}>
          <Text style={[styles.cityName, { color: c.text }]}>{guide.label}</Text>
          <Text style={[styles.body, { color: c.muted }]}>{guide.months}</Text>
          <Text style={[styles.body, { color: c.text }]}>{guide.experiences}</Text>
          <View style={styles.destinations}>
            {guide.destinations.map((name, i) => {
              const match = cities.find((x) => x.name === name);
              return (
                <GlideIn key={name} index={i}>
                  {match ? (
                    <PressableScale
                      accessibilityRole="button"
                      accessibilityLabel={`Open ${name}`}
                      onPress={() => onOpenCity(match)}
                      style={[styles.destination, { backgroundColor: c.primary }]}>
                      <Text style={[styles.destinationText, { color: c.onPrimary }]}>{name} ›</Text>
                    </PressableScale>
                  ) : (
                    <PressableScale
                      accessibilityRole="link"
                      accessibilityLabel={`${name} on Maps`}
                      onPress={() => Linking.openURL(mapsSearchUrl(`${name}, Morocco`)).catch(() => {})}
                      style={[styles.destination, { borderColor: c.primary, borderWidth: 1.5 }]}>
                      <Text style={[styles.destinationText, { color: c.primary }]}>{name} ↗</Text>
                    </PressableScale>
                  )}
                </GlideIn>
              );
            })}
          </View>
          <Text style={[styles.note, { color: c.muted }]}>Filled buttons open the city guide; outlined ones open Maps.</Text>
        </Card>
      </GlideIn>
    </>
  );
}

/* ---------- Parks & nature ---------- */

function ParksView() {
  const c = useThemeColors();
  const { parks } = useGuide();
  return (
    <>
      <Text style={[styles.body, { color: c.muted }]}>Gardens, city parks and national parks to add to your trip.</Text>
      <Card>
        {parks.map((park, i) => (
          <Fragment key={park.name}>
            {i > 0 ? <RowDivider /> : null}
            <GlideIn index={i}>
              <ParkRow park={park} />
            </GlideIn>
          </Fragment>
        ))}
      </Card>
    </>
  );
}

function ParkRow({ park }: { park: Park }) {
  const c = useThemeColors();
  const color = park.kind === 'national' ? c.leaf : park.kind === 'garden' ? c.mint : c.primary;
  return (
    <View style={styles.place}>
      <View style={styles.placeTop}>
        <Text style={[styles.placeName, { color: c.text }]}>{park.name}</Text>
        <Tag label={parkKindLabel[park.kind]} color={color} />
      </View>
      <Text style={[styles.body, { color: c.muted }]}>
        Near {park.near} · {park.bestFor}
      </Text>
      <MapsLink url={mapsSearchUrl(`${park.name}, ${park.near}, Morocco`)} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { padding: 16, gap: 14 },
  views: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  cityHeading: { gap: 4 },
  cityName: { fontFamily: fonts.displaySemi, fontSize: 20 },
  seasonPill: { alignSelf: 'flex-start', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4, marginTop: 2 },
  seasonPillText: { fontFamily: fonts.medium, fontSize: 12.5 },
  callout: { borderWidth: 1, borderLeftWidth: 4, borderRadius: 10, padding: 14, gap: 2 },
  calloutTitle: { fontFamily: fonts.bold, fontSize: 15 },
  sections: { gap: 16 },
  sectionTitle: { fontFamily: fonts.bold, fontSize: 16, marginBottom: 6 },
  body: { fontFamily: fonts.body, fontSize: 14, lineHeight: 20 },
  note: { fontFamily: fonts.body, fontSize: 12.5, lineHeight: 18, marginBottom: 6 },
  place: { paddingHorizontal: 14, paddingTop: 12, paddingBottom: 6, gap: 4 },
  placeTop: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  placeName: { flex: 1, minWidth: 0, fontFamily: fonts.bold, fontSize: 16 },
  tag: { borderRadius: 999, paddingHorizontal: 8, paddingVertical: 2 },
  tagText: { fontFamily: fonts.bold, fontSize: 10.5, letterSpacing: 0.5 },
  mapsLink: { paddingVertical: 6, alignSelf: 'flex-start' },
  mapsText: { fontFamily: fonts.semibold, fontSize: 13 },
  seasonCard: { padding: 14, gap: 8 },
  destinations: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 },
  destination: { borderRadius: 999, paddingHorizontal: 14, paddingVertical: 8 },
  destinationText: { fontFamily: fonts.semibold, fontSize: 14 },
});

/** One quiet line saying how fresh the guide is. */
function GuideStatus({ guide }: { guide: Guide }) {
  const c = useThemeColors();
  const date = guide.savedAt
    ? new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }).format(guide.savedAt)
    : null;
  const text =
    guide.source === 'live'
      ? 'Guide up to date.'
      : guide.source === 'saved'
        ? `Offline copy from ${date}. It updates when you’re back online.`
        : 'Built-in guide. It updates when you’re online.';
  return <Text style={[styles.note, { color: c.muted, textAlign: 'center' }]}>{text}</Text>;
}
