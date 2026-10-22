/**
 * Flights to Morocco: the airports a traveller can land in, common places they fly from,
 * and links that open flight searches already filled in.
 */

export type Airport = {
  /** IATA code, e.g. RAK. */
  code: string;
  /** City as travellers say it. */
  city: string;
  airport: string;
  /** City name in the Cities guide, when the guide has a page for it. */
  guideCity?: string;
};

/** Morocco's main international airports, busiest first. */
export const airports: Airport[] = [
  { code: 'RAK', city: 'Marrakech', airport: 'Marrakech Menara', guideCity: 'Marrakech' },
  { code: 'CMN', city: 'Casablanca', airport: 'Mohammed V', guideCity: 'Casablanca' },
  { code: 'AGA', city: 'Agadir', airport: 'Al Massira', guideCity: 'Agadir' },
  { code: 'TNG', city: 'Tangier', airport: 'Ibn Battouta', guideCity: 'Tangier' },
  { code: 'FEZ', city: 'Fes', airport: 'Fes–Saïss', guideCity: 'Fes' },
  { code: 'RBA', city: 'Rabat', airport: 'Rabat–Salé', guideCity: 'Rabat' },
  { code: 'ESU', city: 'Essaouira', airport: 'Essaouira Mogador', guideCity: 'Essaouira' },
  { code: 'OZZ', city: 'Ouarzazate', airport: 'Ouarzazate', guideCity: 'Ouarzazate' },
  { code: 'NDR', city: 'Nador', airport: 'Nador El Aroui' },
  { code: 'OUD', city: 'Oujda', airport: 'Angads' },
  { code: 'TTU', city: 'Tetouan', airport: 'Sania Ramel' },
  { code: 'AHU', city: 'Al Hoceima', airport: 'Cherif Al Idrissi' },
  { code: 'ERH', city: 'Errachidia', airport: 'Moulay Ali Cherif' },
  { code: 'VIL', city: 'Dakhla', airport: 'Dakhla' },
  { code: 'EUN', city: 'Laayoune', airport: 'Hassan I' },
];

export type Origin = {
  city: string;
  /** IATA city or airport code, used by Kayak. */
  code: string;
  /** Place id in Skyscanner links. */
  skyscanner: string;
};

/** Places many travellers to Morocco fly from. */
export const origins: Origin[] = [
  { city: 'Paris', code: 'PAR', skyscanner: 'pari' },
  { city: 'London', code: 'LON', skyscanner: 'lond' },
  { city: 'Madrid', code: 'MAD', skyscanner: 'mad' },
  { city: 'Barcelona', code: 'BCN', skyscanner: 'bcn' },
  { city: 'Brussels', code: 'BRU', skyscanner: 'bru' },
  { city: 'Amsterdam', code: 'AMS', skyscanner: 'ams' },
  { city: 'Frankfurt', code: 'FRA', skyscanner: 'fra' },
  { city: 'Milan', code: 'MIL', skyscanner: 'mila' },
  { city: 'Rome', code: 'ROM', skyscanner: 'rome' },
  { city: 'Lisbon', code: 'LIS', skyscanner: 'lis' },
  { city: 'Lyon', code: 'LYS', skyscanner: 'lys' },
  { city: 'Marseille', code: 'MRS', skyscanner: 'mrs' },
  { city: 'Istanbul', code: 'IST', skyscanner: 'ista' },
  { city: 'Dubai', code: 'DXB', skyscanner: 'dxba' },
  { city: 'Doha', code: 'DOH', skyscanner: 'doh' },
  { city: 'New York', code: 'NYC', skyscanner: 'nyca' },
  { city: 'Montreal', code: 'YMQ', skyscanner: 'ymqa' },
];

/** Airlines with many flights to Morocco (their home pages). */
export const airlines: { name: string; url: string; note: string }[] = [
  { name: 'Royal Air Maroc', url: 'https://www.royalairmaroc.com', note: "Morocco's national airline" },
  { name: 'Air Arabia', url: 'https://www.airarabia.com', note: 'Low-cost, many flights from Europe' },
  { name: 'Ryanair', url: 'https://www.ryanair.com', note: 'Low-cost from Europe' },
  { name: 'easyJet', url: 'https://www.easyjet.com', note: 'Low-cost from Europe' },
  { name: 'Transavia', url: 'https://www.transavia.com', note: 'Low-cost from France and the Netherlands' },
];

export type FlightSearch = {
  to: Airport;
  /** YYYY-MM-DD */
  depart: string;
  /** YYYY-MM-DD, for a return trip. */
  ret?: string;
  /** A known origin, or a place the traveller typed. */
  from?: Origin | string;
};

const fromName = (from: FlightSearch['from']) => (typeof from === 'string' ? from.trim() : from?.city ?? '');
const knownOrigin = (from: FlightSearch['from']) => (from && typeof from !== 'string' ? from : undefined);

/** Google Flights understands a plain-language search. */
export function googleFlightsUrl(s: FlightSearch): string {
  const from = fromName(s.from);
  const q = `Flights to ${s.to.code}${from ? ` from ${from}` : ''} on ${s.depart}${s.ret ? ` returning ${s.ret}` : ' one way'}`;
  return `https://www.google.com/travel/flights?q=${encodeURIComponent(q)}`;
}

/** Kayak needs a known origin (null without one). */
export function kayakUrl(s: FlightSearch): string | null {
  const o = knownOrigin(s.from);
  if (!o) return null;
  return `https://www.kayak.com/flights/${o.code}-${s.to.code}/${s.depart}${s.ret ? `/${s.ret}` : ''}`;
}

const yymmdd = (iso: string) => iso.slice(2).replace(/-/g, '');

/** Skyscanner needs a known origin (null without one). */
export function skyscannerUrl(s: FlightSearch): string | null {
  const o = knownOrigin(s.from);
  if (!o) return null;
  return `https://www.skyscanner.net/transport/flights/${o.skyscanner}/${s.to.code.toLowerCase()}/${yymmdd(s.depart)}/${s.ret ? `${yymmdd(s.ret)}/` : ''}`;
}

/** Today's date as YYYY-MM-DD in the phone's time zone. */
export function todayIso(now = new Date()): string {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** "Thu 5 Nov 2026" from YYYY-MM-DD. */
export function niceDate(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${days[date.getDay()]} ${d} ${months[m - 1]} ${y}`;
}
