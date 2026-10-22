import type { Season } from '@/data/cities';

export type SeasonGuide = {
  season: Season;
  label: string;
  months: string;
  /** Destinations; names that match a city open its page. */
  destinations: string[];
  experiences: string;
};

export const seasonGuides: SeasonGuide[] = [
  {
    season: 'winter',
    label: 'Winter',
    months: 'December to February',
    destinations: ['Marrakech', 'Agadir', 'Merzouga', 'Ouarzazate', 'Ifrane'],
    experiences: 'Mild coastal weather, desert trips, and possible snow in the mountains.',
  },
  {
    season: 'spring',
    label: 'Spring',
    months: 'March to May',
    destinations: ['Marrakech', 'Chefchaouen', 'Fes', 'Rabat', 'Ourika Valley'],
    experiences: 'Gardens in bloom, sightseeing, hiking and waterfalls.',
  },
  {
    season: 'summer',
    label: 'Summer',
    months: 'June to August',
    destinations: ['Agadir', 'Tangier', 'Essaouira', 'Al Hoceima', 'Dakhla'],
    experiences: 'Beaches, surfing, water sports and cool coastal escapes.',
  },
  {
    season: 'autumn',
    label: 'Autumn',
    months: 'September to November',
    destinations: ['Marrakech', 'Fes', 'Merzouga', 'Chefchaouen', 'Ouarzazate'],
    experiences: 'Desert excursions, historic cities and mountain trips.',
  },
];

/** The season a date falls in, by Moroccan (northern hemisphere) months. */
export function seasonOf(date: Date): Season {
  const m = date.getMonth(); // 0 = January
  if (m === 11 || m <= 1) return 'winter';
  if (m <= 4) return 'spring';
  if (m <= 7) return 'summer';
  return 'autumn';
}
