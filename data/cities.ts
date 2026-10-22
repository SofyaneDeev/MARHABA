export type PlaceKind = 'gate' | 'sight' | 'square' | 'market' | 'garden' | 'nature' | 'nightlife';

export const placeKindLabel: Record<PlaceKind, string> = {
  gate: 'Gate · taxis',
  sight: 'Sight',
  square: 'Square',
  market: 'Market',
  garden: 'Garden',
  nature: 'Nature',
  nightlife: 'Nightlife',
};

/** How places are grouped on a city page, in this order. */
export type PlaceSection = 'landmarks' | 'gardens' | 'nature' | 'nightlife';

export const placeSectionTitle: Record<PlaceSection, string> = {
  landmarks: 'Landmarks & history',
  gardens: 'Gardens & parks',
  nature: 'Nature, beaches & day trips',
  nightlife: 'Evenings & nightlife',
};

export function sectionOf(kind: PlaceKind): PlaceSection {
  switch (kind) {
    case 'garden':
      return 'gardens';
    case 'nature':
      return 'nature';
    case 'nightlife':
      return 'nightlife';
    default:
      return 'landmarks';
  }
}

export type Season = 'winter' | 'spring' | 'summer' | 'autumn';

export type Place = { name: string; kind: PlaceKind; description: string };

export type City = {
  name: string;
  /** City centre, used for prayer times. */
  lat: number;
  lng: number;
  /** One line on what the city is known for, shown under its name. */
  knownFor: string;
  tipTitle: string;
  tipText: string;
  /** Plain-language best time to visit. */
  bestSeason: string;
  /** Seasons this city is recommended for (see data/seasons.ts). */
  seasons: Season[];
  /** Shown in the nightlife section, e.g. when the city has no venues listed. */
  nightlifeTip?: string;
  places: Place[];
};

export const cities: City[] = [
  {
    name: 'Marrakech',
    lat: 31.6295,
    lng: -7.9811,
    knownFor: 'The Red City: souks, palaces and Jemaa el-Fna',
    tipTitle: 'Lost in the souks?',
    tipText: 'Ask for “Jemaa el-Fna” (jem-AH el-FNA). Almost every main lane leads back to the square, and taxis wait on the Koutoubia side.',
    bestSeason: 'Spring and autumn; winter is good for sightseeing',
    seasons: ['winter', 'spring', 'autumn'],
    places: [
      { name: 'Jemaa el-Fna', kind: 'square', description: 'The main square and your reference point. Food stalls open around sunset.' },
      { name: 'Koutoubia Mosque', kind: 'sight', description: "Its minaret is visible from most of the medina, so use it to get your bearings. Non-Muslims can't go inside." },
      { name: 'Bahia Palace', kind: 'sight', description: 'A 19th-century palace with gardens and painted ceilings, on the south side near the Mellah.' },
      { name: 'El Badi Palace', kind: 'sight', description: 'The vast ruins of a 16th-century palace, with storks nesting on its walls and views from the terraces.' },
      { name: 'Saadian Tombs', kind: 'sight', description: 'Richly decorated 16th-century tombs of the Saadian dynasty, beside the Kasbah Mosque.' },
      { name: 'Ben Youssef Madrasa', kind: 'sight', description: 'A former Quranic school with famous carved cedar and zellige tilework, north of the souks.' },
      { name: 'Bab Agnaou', kind: 'gate', description: 'Carved stone gate by the Kasbah and the Saadian Tombs.' },
      { name: 'Bab Doukkala', kind: 'gate', description: 'North-west gate, close to the train and bus stations. Good for catching a taxi.' },
      { name: 'Jardin Majorelle', kind: 'garden', description: 'The cobalt-blue garden restored by Yves Saint Laurent, with cacti, bamboo and a Berber museum. Book tickets ahead in busy months.' },
      { name: 'Le Jardin Secret', kind: 'garden', description: 'A restored riad garden in the medina. A calm break from the souks.' },
      { name: 'Menara Gardens', kind: 'garden', description: 'Olive groves around a large pool and pavilion, with the Atlas mountains behind on clear days.' },
      { name: 'Anima Garden', kind: 'garden', description: 'An art garden created by André Heller, about 30 minutes south of the city.' },
      { name: 'Cyber Park', kind: 'garden', description: 'A free public park with shady paths and orange trees, close to the Koutoubia.' },
      { name: 'Ourika Valley', kind: 'nature', description: 'An Atlas valley about an hour away, with riverside cafés and waterfalls at Setti Fatma.' },
      { name: 'Agafay Desert', kind: 'nature', description: 'A stony desert about 40 minutes away, for sunsets, camel rides and desert camps.' },
      { name: 'Ouzoud Waterfalls', kind: 'nature', description: 'Spectacular waterfalls about three hours away, often with Barbary macaques nearby. A full day trip.' },
      { name: 'Comptoir Darna', kind: 'nightlife', description: 'Dinner with live music and dance shows, in the Hivernage district.' },
      { name: 'Theatro Marrakech', kind: 'nightlife', description: 'A nightclub in a former theatre, in Hivernage.' },
      { name: '555 Famous Club', kind: 'nightlife', description: 'A large nightclub in Hivernage.' },
    ],
  },
  {
    name: 'Tangier',
    lat: 35.7595,
    lng: -5.834,
    knownFor: 'The gateway between Africa and Europe',
    tipTitle: 'Downhill or uphill',
    tipText: 'From the Grand Socco, walk downhill into the medina. Uphill leads to the kasbah and its views over the Strait.',
    bestSeason: 'Spring, summer and early autumn',
    seasons: ['spring', 'summer', 'autumn'],
    nightlifeTip: 'Evenings centre on the marina and the city-centre boulevards.',
    places: [
      { name: 'Grand Socco', kind: 'square', description: 'The busy square between the new town and the medina. Start here.' },
      { name: 'Petit Socco', kind: 'square', description: 'A small café square in the heart of the medina.' },
      { name: 'Kasbah Museum', kind: 'sight', description: "The former sultan's palace at the top of the kasbah, with views across the Strait of Gibraltar." },
      { name: 'American Legation Museum', kind: 'sight', description: 'The first property the United States owned abroad, now a museum of art and history in the medina.' },
      { name: 'Bab el-Kasbah', kind: 'gate', description: 'The gate into the kasbah from the upper medina.' },
      { name: 'Perdicaris Park', kind: 'garden', description: 'Forest walks with sea views west of the city, around a historic villa.' },
      { name: 'Villa Harris Park', kind: 'garden', description: 'The restored gardens of a 19th-century villa on the bay, east of the city.' },
      { name: 'Cap Spartel', kind: 'nature', description: 'The lighthouse where the Atlantic meets the Mediterranean.' },
      { name: 'Caves of Hercules', kind: 'nature', description: 'Sea caves near Cap Spartel. Go by taxi.' },
      { name: 'Achakar Beach', kind: 'nature', description: 'A long Atlantic beach south of Cap Spartel.' },
      { name: 'Dalia Beach', kind: 'nature', description: 'A sheltered Mediterranean cove east of Tangier.' },
    ],
  },
  {
    name: 'Casablanca',
    lat: 33.5731,
    lng: -7.5898,
    knownFor: 'Morocco’s big modern city and the Hassan II Mosque',
    tipTitle: 'A big city',
    tipText: 'Casablanca is spread out. Use the tram and red petit taxis; the Hassan II Mosque is easiest by taxi.',
    bestSeason: 'Spring and autumn; good for city breaks all year',
    seasons: ['spring', 'autumn'],
    places: [
      { name: 'Hassan II Mosque', kind: 'sight', description: 'One of the largest mosques in the world, built partly over the ocean. Non-Muslims can visit on guided tours.' },
      { name: 'Quartier Habous', kind: 'market', description: 'The "new medina" built in the 1930s, with arcades, olive sellers and pastry shops.' },
      { name: 'Old Medina', kind: 'market', description: 'A small, everyday medina next to the port, good for a short walk.' },
      { name: 'Place Mohammed V', kind: 'square', description: 'The grand square of the city centre, surrounded by 1920s Mauresque buildings.' },
      { name: 'Morocco Mall', kind: 'market', description: 'A huge seaside shopping mall with an aquarium.' },
      { name: 'Arab League Park', kind: 'garden', description: 'The city’s largest central park, with palm-lined walks and cafés.' },
      { name: 'Bouskoura Forest', kind: 'garden', description: 'Eucalyptus and pine forest south of the city, for walks, runs and picnics.' },
      { name: 'Corniche Ain Diab', kind: 'nature', description: 'The ocean-front promenade with beaches, cafés and sunsets.' },
      { name: 'Sky 28', kind: 'nightlife', description: 'A bar on the 28th floor of the Kenzi Tower, with views over the city.' },
      { name: 'Le Cabestan', kind: 'nightlife', description: 'A restaurant and lounge on the ocean cliffs by the El Hank lighthouse.' },
    ],
  },
  {
    name: 'Agadir',
    lat: 30.4278,
    lng: -9.5981,
    knownFor: 'Beaches and sunshine on the south coast',
    tipTitle: 'A beach city',
    tipText: 'Agadir was rebuilt after the 1960 earthquake, so there is no old medina. Life centres on the beach and Souk El Had.',
    bestSeason: 'All year: winter sunshine and summer beaches',
    seasons: ['winter', 'spring', 'summer', 'autumn'],
    places: [
      { name: 'Agadir Oufella', kind: 'sight', description: 'The hilltop kasbah ruins with the best view over the bay, reachable by cable car.' },
      { name: 'Amazigh Heritage Museum', kind: 'sight', description: 'Jewellery, carpets and crafts of Amazigh (Berber) culture.' },
      { name: 'Souk El Had', kind: 'market', description: 'One of the biggest markets in Morocco, with thousands of stalls selling food, spices and crafts.' },
      { name: 'Agadir Marina', kind: 'sight', description: 'The modern marina at the north end of the beach.' },
      { name: 'Jardin de Olhão', kind: 'garden', description: 'A garden named after Agadir’s Portuguese twin town, with a small museum about the city before 1960.' },
      { name: 'Crocoparc', kind: 'garden', description: 'Botanical gardens with Nile crocodiles, east of the city.' },
      { name: 'Agadir Beach', kind: 'nature', description: 'A long sandy beach with a seafront promenade, cafés and restaurants.' },
      { name: 'Taghazout', kind: 'nature', description: 'A laid-back surf village about 20 km north.' },
      { name: 'Paradise Valley', kind: 'nature', description: 'Palm-lined gorges and natural pools in the foothills north-east of Agadir.' },
      { name: 'Imouzzer', kind: 'nature', description: 'A mountain village known for its waterfalls, best after rain.' },
      { name: 'Papagayo', kind: 'nightlife', description: 'A beach club on the seafront.' },
    ],
  },
  {
    name: 'Fes',
    lat: 34.0331,
    lng: -5.0003,
    knownFor: 'The oldest medina, tanneries and craftsmen',
    tipTitle: 'Lost in Fes el-Bali?',
    tipText: "The two main streets, Talaa Kebira and Talaa Sghira, both climb up to Bab Boujloud. If you're walking uphill, you're usually heading out.",
    bestSeason: 'Spring and autumn',
    seasons: ['spring', 'autumn'],
    nightlifeTip: 'Fes is quiet at night: hotel lounges and live-music venues, mostly in the new town (Ville Nouvelle).',
    places: [
      { name: 'Bab Boujloud (Blue Gate)', kind: 'gate', description: 'The main entrance to the old city. Taxis and cafés right outside.' },
      { name: 'Chouara Tannery', kind: 'sight', description: 'The famous leather dye pits. Watch from the leather shop terraces; a mint sprig helps with the smell.' },
      { name: 'Al-Qarawiyyin', kind: 'sight', description: 'One of the oldest universities in the world. Non-Muslims can look through the doors.' },
      { name: 'Bou Inania Madrasa', kind: 'sight', description: 'A stunning 14th-century madrasa near Bab Boujloud, open to visitors.' },
      { name: 'Place Seffarine', kind: 'square', description: "The coppersmiths' square. Follow the sound of hammering." },
      { name: "Bab R'cif", kind: 'gate', description: "Lower gate, deep in the medina. Handy for taxis when you're far from Bab Boujloud." },
      { name: 'Jnan Sbil Gardens', kind: 'garden', description: 'Restored royal gardens between Fes el-Bali and Fes el-Jdid, with fountains and a lake.' },
    ],
  },
  {
    name: 'Rabat',
    lat: 34.0209,
    lng: -6.8416,
    knownFor: 'The calm capital by the Atlantic',
    tipTitle: 'Easy to get around',
    tipText: 'Rabat is relaxed and easy to walk. The tram links the city centre, Hassan Tower and Salé across the river.',
    bestSeason: 'Spring and autumn',
    seasons: ['spring', 'autumn'],
    places: [
      { name: 'Kasbah of the Udayas', kind: 'sight', description: 'A 12th-century fortress above the river mouth, with blue-and-white lanes and the Andalusian Gardens.' },
      { name: 'Hassan Tower', kind: 'sight', description: 'The unfinished 12th-century minaret beside the Mausoleum of Mohammed V, where royal guards stand at the gates.' },
      { name: 'Chellah', kind: 'sight', description: 'Roman and Merinid ruins in a walled garden, home to nesting storks.' },
      { name: 'Rue des Consuls', kind: 'market', description: "The medina's calmest souk street, known for carpets and crafts, with little hassle." },
      { name: 'Bab el-Had', kind: 'gate', description: "The medina's main western gate, close to petit taxis." },
      { name: "Jardin d'Essais Botaniques", kind: 'garden', description: 'Historic botanical gardens with shaded paths and rare plants.' },
      { name: 'Ibn Sina Park', kind: 'garden', description: 'Also called Hilton Forest: a large wooded park for walks and running.' },
      { name: 'Bouregreg Marina', kind: 'nature', description: 'Cafés and boats on the river between Rabat and Salé.' },
      { name: 'Rabat Beach', kind: 'nature', description: 'The city beach below the Kasbah of the Udayas, popular with surfers.' },
      { name: 'Le Dhow', kind: 'nightlife', description: 'A restaurant and bar on a wooden boat moored on the Bouregreg river.' },
    ],
  },
  {
    name: 'Essaouira',
    lat: 31.5085,
    lng: -9.7595,
    knownFor: 'A windy, laid-back port on the Atlantic',
    tipTitle: 'Bring a jacket',
    tipText: 'The medina is a small grid, easy to explore on foot. The wind blows strongly most of the year.',
    bestSeason: 'Spring to autumn; expect wind',
    seasons: ['spring', 'summer', 'autumn'],
    nightlifeTip: 'Listen for Gnawa music in cafés, especially during the Gnaoua World Music Festival in early summer.',
    places: [
      { name: 'Skala de la Ville', kind: 'sight', description: 'The sea ramparts with old cannons and views over the Atlantic.' },
      { name: 'Fishing port', kind: 'sight', description: 'Blue boats and fresh fish grilled on the spot. Agree the price before they cook.' },
      { name: 'Place Moulay Hassan', kind: 'square', description: 'The main square between the medina and the port.' },
      { name: 'Bab Doukkala', kind: 'gate', description: 'The northern gate of the medina, near the bus station.' },
      { name: 'Essaouira Beach', kind: 'nature', description: 'A long windy beach, popular for kitesurfing and windsurfing.' },
      { name: 'Diabat', kind: 'nature', description: 'Dunes and a quiet village just south of the beach, reachable on foot or on horseback.' },
      { name: 'Sidi Kaouki', kind: 'nature', description: 'A wild surf beach about 25 km south.' },
      { name: 'Argan forests', kind: 'nature', description: 'Argan trees and women’s cooperatives making argan oil along the roads out of town.' },
      { name: 'Taros', kind: 'nightlife', description: 'A rooftop bar and restaurant above Place Moulay Hassan, with live music.' },
    ],
  },
  {
    name: 'Chefchaouen',
    lat: 35.1688,
    lng: -5.2636,
    knownFor: 'The blue town in the Rif mountains',
    tipTitle: 'Small and easy',
    tipText: 'Everything slopes down to Plaza Uta el-Hammam. Head downhill to find the square, uphill to reach Ras el-Maa.',
    bestSeason: 'Spring and early autumn',
    seasons: ['spring', 'autumn'],
    nightlifeTip: 'Evenings are calm: rooftop and medina cafés, sometimes with live music.',
    places: [
      { name: 'Plaza Uta el-Hammam', kind: 'square', description: 'The main square with cafés facing the kasbah.' },
      { name: 'The Kasbah', kind: 'sight', description: 'A red-walled fortress with a garden and small museum.' },
      { name: 'Bab el-Ain', kind: 'gate', description: 'The main gate, where taxis and the road into town meet.' },
      { name: 'Ras el-Maa', kind: 'nature', description: 'The spring at the top of town where locals wash clothes.' },
      { name: 'Spanish Mosque viewpoint', kind: 'nature', description: 'A 30-minute walk up for the best sunset view over the blue city.' },
      { name: 'Talassemtane National Park', kind: 'nature', description: 'Fir and cedar forests in the Rif mountains, with trails leaving from town.' },
      { name: 'Akchour Waterfalls', kind: 'nature', description: "A day hike to waterfalls and God's Bridge, a natural rock arch, about 45 minutes' drive away." },
    ],
  },
  {
    name: 'Ouarzazate',
    lat: 30.9189,
    lng: -6.8934,
    knownFor: 'The door to the desert and Morocco’s film studios',
    tipTitle: 'Gateway to the south',
    tipText: 'Ouarzazate is the starting point for the Draa and Dades valleys and the desert. Grand taxis and tours leave from here.',
    bestSeason: 'Spring and autumn; winter days are often pleasant',
    seasons: ['winter', 'spring', 'autumn'],
    nightlifeTip: 'Evenings are quiet: hotel lounges, dinner, and starry skies on desert-camp nights.',
    places: [
      { name: 'Aït Benhaddou', kind: 'sight', description: 'A fortified earthen village and UNESCO site about 30 km away, seen in many films.' },
      { name: 'Taourirt Kasbah', kind: 'sight', description: 'A 19th-century kasbah of the Glaoui family in the town centre.' },
      { name: 'Telouet Kasbah', kind: 'sight', description: 'The crumbling, painted palace of the Glaoui family on the old Atlas caravan route, north of Ouarzazate.' },
      { name: 'Atlas Film Studios', kind: 'sight', description: 'Film sets you can tour, just outside town.' },
      { name: 'Fint Oasis', kind: 'nature', description: 'A hidden palm oasis a short drive from town.' },
      { name: 'Skoura Oasis', kind: 'nature', description: 'Palm groves dotted with old kasbahs, east on the road to the Dades Valley.' },
      { name: 'Draa Valley', kind: 'nature', description: 'A long river valley of palms and kasbahs running south towards Zagora.' },
    ],
  },
  {
    name: 'Ifrane',
    lat: 33.5228,
    lng: -5.1106,
    knownFor: 'The “Switzerland of Morocco” in the Middle Atlas',
    tipTitle: 'Pack a jacket',
    tipText: 'Ifrane is high in the mountains and much cooler than the rest of Morocco. It can snow in winter.',
    bestSeason: 'Winter for snow; spring and summer for green landscapes',
    seasons: ['winter', 'spring', 'summer'],
    nightlifeTip: 'Evenings are quiet: hotel lounges and cafés.',
    places: [
      { name: 'Lion Stone', kind: 'sight', description: 'The town’s famous stone lion, carved in the 1930s, in a park near the centre.' },
      { name: 'Ifrane town centre', kind: 'square', description: 'Alpine-style houses with sloping roofs, flower gardens and cafés.' },
      { name: 'Ifrane National Park', kind: 'nature', description: 'Cedar forests, lakes and Barbary macaques.' },
      { name: 'Azrou Cedar Forest', kind: 'nature', description: 'Ancient Atlas cedars near the town of Azrou, where Barbary macaques live.' },
      { name: 'Dayet Aoua', kind: 'nature', description: 'A lake circled by a walking trail, a short drive north of Ifrane.' },
      { name: 'Michlifen', kind: 'nature', description: 'A ski area in a volcanic crater; snow depends on the winter.' },
    ],
  },
  {
    name: 'Meknes',
    lat: 33.8935,
    lng: -5.5473,
    knownFor: 'The imperial city of Sultan Moulay Ismail',
    tipTitle: 'Start at the square',
    tipText: 'Begin at Place el-Hedim. The souks are behind it, and the imperial city lies through Bab Mansour.',
    bestSeason: 'Spring and autumn',
    seasons: ['spring', 'autumn'],
    places: [
      { name: 'Bab Mansour', kind: 'gate', description: 'One of the grandest gates in Morocco, covered in green and black zellige.' },
      { name: 'Place el-Hedim', kind: 'square', description: 'The big square in front of Bab Mansour, lively in the evening.' },
      { name: 'Heri es-Souani', kind: 'sight', description: 'Huge 17th-century granaries and stables built for Sultan Moulay Ismail.' },
      { name: 'Volubilis', kind: 'sight', description: 'Roman ruins and a UNESCO site about 30 km north. Go by grand taxi or on a half-day trip.' },
    ],
  },
  {
    name: 'Merzouga',
    lat: 31.0802,
    lng: -4.0133,
    knownFor: 'The Sahara dunes of Erg Chebbi',
    tipTitle: 'Plan your desert night',
    tipText: 'Book your desert camp before you arrive, and ask exactly what is included: transfer, dinner and camel ride.',
    bestSeason: 'Autumn to spring; summer days are very hot',
    seasons: ['winter', 'autumn'],
    places: [
      { name: 'Erg Chebbi', kind: 'nature', description: 'Orange sand dunes up to about 150 m high. Sunrise and sunset are the best times.' },
      { name: 'Desert camps', kind: 'nature', description: 'Spend a night in a camp in the dunes, usually reached by camel or 4x4.' },
      { name: 'Khamlia', kind: 'sight', description: 'A village known for its Gnawa music, a short drive south.' },
    ],
  },
];

export function findCity(name: string): City | undefined {
  return cities.find((c) => c.name === name);
}

export function mapsUrl(place: Place, city: City): string {
  return mapsSearchUrl(`${place.name}, ${city.name}, Morocco`);
}

export function mapsSearchUrl(query: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}
