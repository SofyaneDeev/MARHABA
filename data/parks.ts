export type ParkKind = 'garden' | 'park' | 'national';

export type Park = { name: string; near: string; bestFor: string; kind: ParkKind };

export const parkKindLabel: Record<ParkKind, string> = {
  garden: 'Garden',
  park: 'City park',
  national: 'National park',
};

/** Gardens, parks and protected nature areas across Morocco. */
export const parks: Park[] = [
  { name: 'Jardin Majorelle', near: 'Marrakech', bestFor: 'Botanical garden', kind: 'garden' },
  { name: 'Menara Gardens', near: 'Marrakech', bestFor: 'Gardens and Atlas viewpoints', kind: 'garden' },
  { name: 'Cyber Park', near: 'Marrakech', bestFor: 'Shady green space in the city', kind: 'park' },
  { name: 'Perdicaris Park', near: 'Tangier', bestFor: 'Forest walks and sea views', kind: 'park' },
  { name: 'Villa Harris Park', near: 'Tangier', bestFor: 'Gardens and relaxing', kind: 'garden' },
  { name: 'Arab League Park', near: 'Casablanca', bestFor: 'Central city park', kind: 'park' },
  { name: 'Bouskoura Forest', near: 'Casablanca', bestFor: 'Walking and outdoor fun', kind: 'park' },
  { name: 'Jnan Sbil Gardens', near: 'Fes', bestFor: 'Historic gardens', kind: 'garden' },
  { name: "Jardin d'Essais Botaniques", near: 'Rabat', bestFor: 'Botanical garden', kind: 'garden' },
  { name: 'Talassemtane National Park', near: 'Chefchaouen', bestFor: 'Hiking and mountain scenery', kind: 'national' },
  { name: 'Ifrane National Park', near: 'Ifrane', bestFor: 'Cedar forests and wildlife', kind: 'national' },
  { name: 'Souss-Massa National Park', near: 'Agadir region', bestFor: 'Birdwatching and protected coast', kind: 'national' },
  { name: 'Toubkal National Park', near: 'High Atlas', bestFor: 'Mountain trekking', kind: 'national' },
  { name: 'Al Hoceima National Park', near: 'Al Hoceima', bestFor: 'Coastal nature', kind: 'national' },
  { name: 'Tazekka National Park', near: 'Taza', bestFor: 'Forests and caves', kind: 'national' },
];
