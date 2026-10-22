import { appGroups, appLink } from '@/data/apps';
import { bookingCategories } from '@/data/booking';
import { providers } from '@/data/providers';
import { cities, findCity, mapsUrl, sectionOf } from '@/data/cities';
import { parks } from '@/data/parks';
import { seasonGuides, seasonOf } from '@/data/seasons';
import { filterPhrases, phraseCategories } from '@/data/phrases';
import { formatReply } from '@/lib/formatReply';

describe('formatReply', () => {
  it('makes **bold** text and bullets', () => {
    expect(formatReply('**Hi**\n- one')).toEqual([
      { text: 'Hi', bold: true },
      { text: '\n', bold: false },
      { text: '•  one', bold: false },
    ]);
  });

  it('drops markdown headings', () => {
    expect(formatReply('## Tips')).toEqual([{ text: 'Tips', bold: false }]);
  });
});

describe('filterPhrases', () => {
  it('lists every category once, after All', () => {
    expect(phraseCategories).toEqual(['All', 'Basics', 'Shopping', 'Getting around', 'Food', 'Emergency']);
  });

  it('searches tips too', () => {
    const darija = filterPhrases('All', 'taxi').map((p) => p.darija);
    expect(darija).toEqual(['Dir l-compteur 3afak']);
  });

  it('filters by category', () => {
    expect(filterPhrases('Food', '').every((p) => p.category === 'Food')).toBe(true);
  });
});

describe('cities', () => {
  it('covers 12 cities, each with places, a tip and a best season', () => {
    expect(cities).toHaveLength(12);
    for (const city of cities) {
      expect(city.places.length).toBeGreaterThan(0);
      expect(city.tipText.length).toBeGreaterThan(0);
      expect(city.bestSeason.length).toBeGreaterThan(0);
      expect(city.seasons.length).toBeGreaterThan(0);
    }
  });

  it('groups places into landmarks, gardens, nature and nightlife', () => {
    const marrakech = findCity('Marrakech')!;
    const sections = new Set(marrakech.places.map((p) => sectionOf(p.kind)));
    expect([...sections].sort()).toEqual(['gardens', 'landmarks', 'nature', 'nightlife']);
    expect(sectionOf('gate')).toBe('landmarks');
  });

  it('has unique city and place names', () => {
    expect(new Set(cities.map((c) => c.name)).size).toBe(cities.length);
    for (const city of cities) {
      expect(new Set(city.places.map((p) => p.name)).size).toBe(city.places.length);
    }
  });
});

describe('bookingCategories', () => {
  it('fills searches with the chosen city', () => {
    const essaouira = cities.find((c) => c.name === 'Essaouira')!;
    const stay = bookingCategories(essaouira).find((s) => s.id === 'stay')!;
    expect(stay.options.map((o) => o.url)).toEqual([
      'https://www.booking.com/searchresults.html?ss=riad%20Essaouira%2C%20Morocco',
      'https://www.airbnb.com/s/Essaouira%2C%20Morocco/homes',
    ]);
  });

  it('covers stays to delivery, each with a known company and a secure link', () => {
    const categories = bookingCategories(cities[0]);
    expect(categories.map((c) => c.id)).toEqual(['stay', 'tours', 'culture', 'desert', 'transport', 'rides', 'food']);
    for (const category of categories) {
      expect(category.options.length).toBeGreaterThan(0);
      for (const option of category.options) {
        expect(providers[option.provider]).toBeDefined();
        expect(option.url.startsWith('https://')).toBe(true);
      }
    }
  });
});

describe('mapsUrl', () => {
  it('builds a Google Maps search link for the place', () => {
    const fes = findCity('Fes')!;
    expect(mapsUrl(fes.places[0], fes)).toBe(
      'https://www.google.com/maps/search/?api=1&query=Bab%20Boujloud%20(Blue%20Gate)%2C%20Fes%2C%20Morocco',
    );
  });
});

describe('seasons', () => {
  it('maps months to seasons', () => {
    expect(seasonOf(new Date(2026, 0, 15))).toBe('winter');
    expect(seasonOf(new Date(2026, 3, 15))).toBe('spring');
    expect(seasonOf(new Date(2026, 6, 15))).toBe('summer');
    expect(seasonOf(new Date(2026, 9, 22))).toBe('autumn');
    expect(seasonOf(new Date(2026, 11, 1))).toBe('winter');
  });

  it('agrees with each city it recommends', () => {
    for (const guide of seasonGuides) {
      for (const name of guide.destinations) {
        const city = findCity(name);
        if (city) expect(city.seasons).toContain(guide.season);
      }
    }
  });
});

describe('parks', () => {
  it('lists 15 distinct parks', () => {
    expect(parks).toHaveLength(15);
    expect(new Set(parks.map((p) => p.name)).size).toBe(15);
  });
});

describe('local apps', () => {
  it('only links to https pages', () => {
    for (const group of appGroups) {
      for (const app of group.apps) {
        for (const url of [app.url, app.iosUrl, app.androidUrl].filter(Boolean)) {
          expect(url!.startsWith('https://')).toBe(true);
        }
      }
    }
  });

  it('opens the right store for the phone', () => {
    const kooul = appGroups.flatMap((g) => g.apps).find((a) => a.name === 'Kooul')!;
    expect(appLink(kooul, 'ios')).toContain('apps.apple.com');
    expect(appLink(kooul, 'android')).toContain('play.google.com');
    const glovo = appGroups.flatMap((g) => g.apps).find((a) => a.name === 'Glovo')!;
    expect(appLink(glovo, 'ios')).toBe('https://glovoapp.com');
  });
});

describe('provider logos', () => {
  it('gives every company a logo image', () => {
    for (const [id, provider] of Object.entries(providers)) {
      expect([id, provider.logo]).toEqual([id, expect.anything()]);
    }
  });
});
