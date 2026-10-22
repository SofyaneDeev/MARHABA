import { CalculationParameters, Coordinates, PrayerTimes } from 'adhan';

export type PrayerName = 'fajr' | 'sunrise' | 'dhuhr' | 'asr' | 'maghrib' | 'isha';

export const prayerLabels: Record<PrayerName, { en: string; ar: string }> = {
  fajr: { en: 'Fajr', ar: 'الفجر' },
  sunrise: { en: 'Sunrise', ar: 'الشروق' },
  dhuhr: { en: 'Dhuhr', ar: 'الظهر' },
  asr: { en: 'Asr', ar: 'العصر' },
  maghrib: { en: 'Maghrib', ar: 'المغرب' },
  isha: { en: 'Isha', ar: 'العشاء' },
};

const ORDER: PrayerName[] = ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha'];

// Angles used in Morocco: Fajr at 19° and Isha at 17° below the horizon.
const MOROCCO_FAJR_ANGLE = 19;
const MOROCCO_ISHA_ANGLE = 17;
export const MOROCCO_TIME_ZONE = 'Africa/Casablanca';

export type DayTimes = { name: PrayerName; time: Date }[];

/** Calculated prayer times for a place on a given day (the day of `date` in Morocco). */
export function prayerTimes(lat: number, lng: number, date: Date = new Date()): DayTimes {
  const params = new CalculationParameters('Other', MOROCCO_FAJR_ANGLE, MOROCCO_ISHA_ANGLE);
  const times = new PrayerTimes(new Coordinates(lat, lng), moroccoCalendarDay(date), params);
  return ORDER.map((name) => ({ name, time: times[name] }));
}

/** The next prayer after `now`, or null once Isha has passed. Sunrise isn't a prayer. */
export function nextPrayer(times: DayTimes, now: Date = new Date()): PrayerName | null {
  return times.find((t) => t.name !== 'sunrise' && t.time.getTime() > now.getTime())?.name ?? null;
}

/** "05:42", shown in Moroccan time whatever the phone's own time zone. */
export function formatMoroccoTime(date: Date): string {
  return new Intl.DateTimeFormat('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: MOROCCO_TIME_ZONE,
  }).format(date);
}

/** A local Date whose year/month/day are today's date in Morocco (what adhan expects). */
function moroccoCalendarDay(date: Date): Date {
  const parts = new Intl.DateTimeFormat('en-CA', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    timeZone: MOROCCO_TIME_ZONE,
  }).formatToParts(date);
  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value);
  return new Date(get('year'), get('month') - 1, get('day'));
}
