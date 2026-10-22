import { fireEvent, render, screen } from '@testing-library/react-native';

import RequestScreen from '@/app/request/[id]';
import { ExperienceList } from '@/components/ExperienceList';
import { addDays, sendBookingRequest, toIsoDate, validateRequest, type BookingRequestInput } from '@/lib/bookings';

// Pretend a backend is configured; every request goes to the mocked fetch below.
jest.mock('@/lib/supabase', () => ({
  hasBackend: () => true,
  SUPABASE_URL: 'https://test.supabase.co',
  supabaseHeaders: (extra: Record<string, string> = {}) => ({ apikey: 'anon', ...extra }),
}));

// Guide requests are switched off in the app for now; these tests keep the feature working for when it returns.
jest.mock('@/constants/features', () => ({ GUIDE_REQUESTS_ENABLED: true }));

const mockPush = jest.fn();
const mockBack = jest.fn();
jest.mock('expo-router', () => ({
  router: { push: (...args: unknown[]) => mockPush(...args), back: () => mockBack() },
  useLocalSearchParams: () => ({ id: 'exp-1' }),
}));

const SAMPLE = {
  id: 'exp-1',
  city: 'Fes',
  category: 'tour',
  title: 'Fes el-Bali guided walk',
  description: 'The tanneries and the craft quarters.',
  duration: '4 hours',
  price_from_mad: 350,
  guide_name: null,
  licensed: false,
  is_sample: true,
};

const json = (body: unknown, status = 200) =>
  ({ ok: status >= 200 && status < 300, status, json: async () => body }) as Response;

const realFetch = globalThis.fetch;
let fetchMock: jest.Mock;
beforeEach(() => {
  fetchMock = jest.fn();
  globalThis.fetch = fetchMock as unknown as typeof fetch;
  mockPush.mockClear();
  mockBack.mockClear();
});
afterAll(() => {
  globalThis.fetch = realFetch;
});

const today = new Date(2026, 9, 21); // 21 Oct 2026
const valid: BookingRequestInput = {
  experienceId: 'exp-1',
  name: 'Amina',
  email: 'amina@example.com',
  whatsapp: '',
  date: '2026-11-02',
  groupSize: 2,
  message: '',
  consent: true,
};

describe('validateRequest', () => {
  it('accepts a complete request', () => {
    expect(validateRequest(valid, today)).toEqual({});
  });

  it('explains each problem', () => {
    const errors = validateRequest(
      { ...valid, name: 'A', email: 'amina@', whatsapp: 'call me', groupSize: 0, consent: false },
      today,
    );
    expect(Object.keys(errors).sort()).toEqual(['consent', 'email', 'groupSize', 'name', 'whatsapp']);
  });

  it('rejects past, impossible and far-off dates', () => {
    expect(validateRequest({ ...valid, date: '2026-10-20' }, today).date).toMatch(/today or a later/);
    expect(validateRequest({ ...valid, date: '2026-02-30' }, today).date).toMatch(/YYYY-MM-DD/);
    expect(validateRequest({ ...valid, date: '2028-01-01' }, today).date).toMatch(/12 months/);
    expect(validateRequest({ ...valid, date: '2026-10-21' }, today).date).toBeUndefined();
  });
});

describe('sendBookingRequest', () => {
  it('posts the request without asking to read it back', async () => {
    fetchMock.mockResolvedValue(json(null, 201));
    await sendBookingRequest({ ...valid, name: '  Amina ', whatsapp: '+212 600 000000', message: ' Vegetarian ' });

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('https://test.supabase.co/rest/v1/booking_requests');
    expect(init.method).toBe('POST');
    expect(init.headers.Prefer).toBe('return=minimal');
    expect(JSON.parse(init.body)).toEqual({
      experience_id: 'exp-1',
      traveller_name: 'Amina',
      email: 'amina@example.com',
      whatsapp: '+212 600 000000',
      preferred_date: '2026-11-02',
      group_size: 2,
      message: 'Vegetarian',
      consent: true,
    });
  });

  it('turns a refusal into a readable message', async () => {
    fetchMock.mockResolvedValue(json({ code: '42501' }, 401));
    await expect(sendBookingRequest(valid)).rejects.toThrow(/could not be saved/);
  });
});

describe('ExperienceList', () => {
  it('shows experiences with a Sample badge and opens the request form', async () => {
    fetchMock.mockResolvedValue(json([SAMPLE]));
    await render(<ExperienceList city="Fes" />);

    expect(await screen.findByText('Fes el-Bali guided walk')).toBeTruthy();
    expect(screen.getByText('SAMPLE')).toBeTruthy();
    expect(screen.getByText('4 hours · from 350 MAD')).toBeTruthy();
    expect(fetchMock.mock.calls[0][0]).toContain('experiences?city=eq.Fes');

    await fireEvent.press(screen.getByLabelText('Request to book: Fes el-Bali guided walk'));
    expect(mockPush).toHaveBeenCalledWith({ pathname: '/request/[id]', params: { id: 'exp-1' } });
  });

  it('says so when a city has no guides yet', async () => {
    fetchMock.mockResolvedValue(json([]));
    await render(<ExperienceList city="Agadir" />);
    expect(await screen.findByText(/No guides are listed in Agadir yet/)).toBeTruthy();
  });
});

describe('Request form', () => {
  it('checks the form, then sends and confirms', async () => {
    fetchMock.mockResolvedValueOnce(json([SAMPLE])).mockResolvedValueOnce(json(null, 201));
    await render(<RequestScreen />);
    expect(await screen.findByText(/This is a sample listing/)).toBeTruthy();

    // Sending an empty form shows what to fix and sends nothing.
    await fireEvent.press(screen.getByText('Send request'));
    expect(screen.getByText(/Enter your name/)).toBeTruthy();
    expect(fetchMock).toHaveBeenCalledTimes(1);

    const date = toIsoDate(addDays(new Date(), 5));
    await fireEvent.changeText(screen.getByLabelText('Your name'), 'Amina');
    await fireEvent.changeText(screen.getByLabelText('Email'), 'amina@example.com');
    await fireEvent.changeText(screen.getByLabelText('Preferred date'), date);
    await fireEvent.press(screen.getByLabelText('More people'));
    await fireEvent.press(screen.getByRole('checkbox'));
    await fireEvent.press(screen.getByText('Send request'));

    expect(await screen.findByText('Request sent')).toBeTruthy();
    expect(JSON.parse(fetchMock.mock.calls[1][1].body)).toMatchObject({
      traveller_name: 'Amina',
      preferred_date: date,
      group_size: 3,
      consent: true,
    });
  });
});
