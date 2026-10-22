import { hasBackend, SUPABASE_URL, supabaseHeaders } from '@/lib/supabase';

export type ExperienceCategory = 'tour' | 'culture' | 'food' | 'desert' | 'outdoor';

export const categoryLabel: Record<ExperienceCategory, string> = {
  tour: 'Guided tour',
  culture: 'Culture',
  food: 'Food',
  desert: 'Desert',
  outdoor: 'Outdoors',
};

/** A row of the `experiences` table. */
export type Experience = {
  id: string;
  city: string;
  category: ExperienceCategory;
  title: string;
  description: string;
  duration: string | null;
  price_from_mad: number | null;
  guide_name: string | null;
  licensed: boolean;
  is_sample: boolean;
};

/** An error whose message can be shown to the traveller as is. */
export class BookingError extends Error {}

const OFFLINE = 'No connection. Check your internet and try again.';
const GENERIC = 'Something went wrong. Try again in a moment.';
const COLUMNS = 'id,city,category,title,description,duration,price_from_mad,guide_name,licensed,is_sample';

async function request(path: string, init: RequestInit = {}): Promise<Response> {
  if (!hasBackend()) throw new BookingError('Bookings are not connected yet.');
  try {
    return await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
      ...init,
      headers: supabaseHeaders(init.headers as Record<string, string> | undefined),
    });
  } catch {
    throw new BookingError(OFFLINE);
  }
}

export async function fetchExperiences(city: string): Promise<Experience[]> {
  const res = await request(
    `experiences?city=eq.${encodeURIComponent(city)}&select=${COLUMNS}&order=is_sample.asc,price_from_mad.asc`,
  );
  if (!res.ok) throw new BookingError(GENERIC);
  return (await res.json()) as Experience[];
}

export async function fetchExperience(id: string): Promise<Experience | null> {
  const res = await request(`experiences?id=eq.${encodeURIComponent(id)}&select=${COLUMNS}&limit=1`);
  if (!res.ok) throw new BookingError(GENERIC);
  const rows = (await res.json()) as Experience[];
  return rows[0] ?? null;
}

export type BookingRequestInput = {
  experienceId: string;
  name: string;
  email: string;
  whatsapp: string;
  /** YYYY-MM-DD */
  date: string;
  groupSize: number;
  message: string;
  consent: boolean;
};

export type BookingField = 'name' | 'email' | 'whatsapp' | 'date' | 'groupSize' | 'message' | 'consent';
export type FieldErrors = Partial<Record<BookingField, string>>;

export const MAX_GROUP = 20;
const MAX_DAYS_AHEAD = 365;

/** A local calendar date as YYYY-MM-DD. */
export function toIsoDate(date: Date): string {
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${m}-${d}`;
}

export function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

/** Same rules as the database, so travellers see problems before sending. */
export function validateRequest(input: BookingRequestInput, today: Date = new Date()): FieldErrors {
  const errors: FieldErrors = {};
  const name = input.name.trim();
  if (name.length < 2 || name.length > 80) errors.name = 'Enter your name (2 to 80 characters).';

  const email = input.email.trim();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) || email.length > 254) {
    errors.email = 'Enter a valid email address, like name@example.com.';
  }

  const whatsapp = input.whatsapp.trim();
  if (whatsapp && !/^\+?[0-9 ]{6,20}$/.test(whatsapp)) {
    errors.whatsapp = 'Use digits only, with your country code, like +212 600 000000.';
  }

  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(input.date.trim());
  const parsed = match ? new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3])) : null;
  if (!parsed || toIsoDate(parsed) !== input.date.trim()) {
    errors.date = 'Enter a date as YYYY-MM-DD, or pick one of the buttons.';
  } else if (input.date.trim() < toIsoDate(today)) {
    errors.date = 'Choose today or a later date.';
  } else if (input.date.trim() > toIsoDate(addDays(today, MAX_DAYS_AHEAD))) {
    errors.date = 'Choose a date within the next 12 months.';
  }

  if (!Number.isInteger(input.groupSize) || input.groupSize < 1 || input.groupSize > MAX_GROUP) {
    errors.groupSize = `Groups can be 1 to ${MAX_GROUP} people.`;
  }
  if (input.message.length > 1000) errors.message = 'Keep your message under 1,000 characters.';
  if (!input.consent) errors.consent = 'Please agree so we can contact you about this booking.';
  return errors;
}

export async function sendBookingRequest(input: BookingRequestInput): Promise<void> {
  const res = await request('booking_requests', {
    method: 'POST',
    // The app may create requests but not read them back.
    headers: { 'Content-Type': 'application/json', Prefer: 'return=minimal' },
    body: JSON.stringify({
      experience_id: input.experienceId,
      traveller_name: input.name.trim(),
      email: input.email.trim(),
      whatsapp: input.whatsapp.trim() || null,
      preferred_date: input.date.trim(),
      group_size: input.groupSize,
      message: input.message.trim() || null,
      consent: input.consent,
    }),
  });
  if (!res.ok) {
    throw new BookingError(
      res.status === 401 || res.status === 400
        ? 'Your request could not be saved. Check the date and your details, then try again.'
        : GENERIC,
    );
  }
}
