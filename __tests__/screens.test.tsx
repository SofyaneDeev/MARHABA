import { fireEvent, render, screen } from '@testing-library/react-native';
import { Linking } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import BookScreen from '@/app/(tabs)/book';
import RequestScreen from '@/app/request/[id]';
import AskScreen from '@/app/(tabs)/ask';
import MedinaScreen from '@/app/(tabs)/medina';
import PhrasesScreen from '@/app/(tabs)/phrases';
import SosScreen from '@/app/sos';
import { WelcomeScreen } from '@/components/Welcome';

describe('Ask', () => {
  const realFetch = globalThis.fetch;
  beforeEach(() => {
    // Never reach the real backend from tests.
    globalThis.fetch = jest.fn(() => Promise.reject(new Error('offline'))) as unknown as typeof fetch;
  });
  afterEach(() => {
    globalThis.fetch = realFetch;
  });

  it('shows suggestions, and a friendly error when the assistant is unreachable', async () => {
    await render(<AskScreen />);
    expect(screen.getByText('How do I get from Fes to Merzouga?')).toBeTruthy();
    // The guide stands above the chat and is introduced, honestly, as an AI assistant.
    expect(screen.getByLabelText(/Your Marhaba guide, a young Moroccan man/)).toBeTruthy();
    expect(screen.getByText('Your Marhaba guide')).toBeTruthy();
    expect(screen.getByText('AI assistant · answers in your language')).toBeTruthy();

    await fireEvent.press(screen.getByText('What should I wear in the medina?'));
    expect(await screen.findByText(/not connected yet|No connection/)).toBeTruthy();
  });
});

describe('Phrases', () => {
  it('filters by search', async () => {
    await render(<PhrasesScreen />);
    expect(screen.getByText('Shukran')).toBeTruthy();

    await fireEvent.changeText(screen.getByLabelText('Search phrases'), 'taxi');
    expect(screen.getByText('Dir l-compteur 3afak')).toBeTruthy();
    expect(screen.queryByText('Shukran')).toBeNull();
  });
});

describe('Medina', () => {
  it('switches city', async () => {
    await render(<MedinaScreen />);
    expect(screen.getByText('Jemaa el-Fna')).toBeTruthy();

    await fireEvent.press(screen.getByText('Fes'));
    expect(screen.getByText('Bab Boujloud (Blue Gate)')).toBeTruthy();
  });
});

describe('Cities', () => {
  it('reaches the new cities', async () => {
    await render(<MedinaScreen />);
    await fireEvent.press(screen.getByText('Merzouga'));
    expect(screen.getByText('Erg Chebbi')).toBeTruthy();
    expect(screen.getByText('The Sahara dunes of Erg Chebbi')).toBeTruthy();
  });
});

describe('Cities views', () => {
  it('shows a city in sections, with a best season and a nightlife note', async () => {
    await render(<MedinaScreen />);
    expect(screen.getByText('🗓 Best time: Spring and autumn; winter is good for sightseeing')).toBeTruthy();
    expect(screen.getByText('Gardens & parks')).toBeTruthy();
    expect(screen.getByText('Jardin Majorelle')).toBeTruthy();
    expect(screen.getByText(/check opening times on Maps/)).toBeTruthy();
  });

  it('opens a city from the season guide', async () => {
    await render(<MedinaScreen />);
    await fireEvent.press(screen.getByText('Seasons'));
    await fireEvent.press(screen.getByText('Winter'));
    expect(screen.getByText('December to February')).toBeTruthy();

    await fireEvent.press(screen.getByLabelText('Open Ifrane'));
    expect(screen.getByText('Lion Stone')).toBeTruthy();
  });

  it('lists parks and national parks', async () => {
    await render(<MedinaScreen />);
    await fireEvent.press(screen.getByText('Parks & nature'));
    expect(screen.getByText('Toubkal National Park')).toBeTruthy();
    expect(screen.getByText('Near High Atlas · Mountain trekking')).toBeTruthy();
  });
});

describe('Book', () => {
  it('opens stays for the chosen city by default', async () => {
    const openURL = jest.spyOn(Linking, 'openURL').mockResolvedValue(undefined);
    await render(<BookScreen />);

    await fireEvent.press(screen.getByText('Tangier'));
    expect(screen.getByText('Stays in Tangier')).toBeTruthy();
    await fireEvent.press(screen.getByLabelText('Open Booking.com'));
    expect(openURL).toHaveBeenCalledWith('https://www.booking.com/searchresults.html?ss=riad%20Tangier%2C%20Morocco');
    openURL.mockRestore();
  });

  it('switches category from the icon grid', async () => {
    await render(<BookScreen />);
    await fireEvent.press(screen.getByLabelText('Rides'));
    for (const name of ['inDrive', 'Careem', 'Uber', 'Heetch', 'Yango']) {
      expect(screen.getByText(name)).toBeTruthy();
    }
    expect(screen.getByText(/Metered petit taxis are the official option/)).toBeTruthy();

    await fireEvent.press(screen.getByLabelText('Food & culture'));
    // Options from another company say where they open.
    expect(screen.getByLabelText('Open Cooking classes on GetYourGuide')).toBeTruthy();
  });

  it('opens food delivery apps', async () => {
    const openURL = jest.spyOn(Linking, 'openURL').mockResolvedValue(undefined);
    await render(<BookScreen />);
    await fireEvent.press(screen.getByLabelText('Delivery'));
    for (const name of ['Glovo', 'Kooul', 'Yassir']) {
      expect(screen.getByText(name)).toBeTruthy();
    }
    await fireEvent.press(screen.getByLabelText('Open Glovo'));
    expect(openURL).toHaveBeenCalledWith('https://glovoapp.com');
    openURL.mockRestore();
  });
});

describe('Guide requests (switched off for now)', () => {
  it('shows only partner sites in Book', async () => {
    await render(<BookScreen />);
    expect(screen.queryByText(/Local guides & experiences/)).toBeNull();
    expect(screen.queryByText(/Request to book/)).toBeNull();
    expect(screen.getByText('What do you need?'.toUpperCase())).toBeTruthy();
  });

  it('says the request page is coming soon', async () => {
    await render(<RequestScreen />);
    expect(screen.getByText('Guide requests are coming soon')).toBeTruthy();
  });
});

describe('Welcome', () => {
  it('greets in Arabic, Amazigh and English, then starts', async () => {
    const onStart = jest.fn();
    await render(
      <SafeAreaProvider initialMetrics={{ frame: { x: 0, y: 0, width: 375, height: 812 }, insets: { top: 0, left: 0, right: 0, bottom: 0 } }}>
        <WelcomeScreen onStart={onStart} />
      </SafeAreaProvider>,
    );
    expect(screen.getByText('مرحبا')).toBeTruthy();
    // Spelled out letter by letter, but read as one word by screen readers.
    expect(screen.getByLabelText('ⴰⵏⵙⵓⴼ')).toBeTruthy();
    // Spelled correctly: "Marhaba", not the artwork's "Marahaba".
    expect(screen.getByLabelText('Marhaba')).toBeTruthy();
    expect(screen.getByText('Your Morocco adventure starts here')).toBeTruthy();
    expect(screen.getByLabelText(/Your Marhaba guide in a fez and djellaba/)).toBeTruthy();
    for (const label of ['Discover places', 'Get around easily', 'Find the best food', 'Ask about local culture']) {
      expect(screen.getByText(label)).toBeTruthy();
    }

    await fireEvent.press(screen.getByLabelText('Get started'));
    expect(onStart).toHaveBeenCalledTimes(1);
  });
});

describe('SOS', () => {
  it('lists the four emergency numbers with call buttons', async () => {
    await render(<SosScreen />);
    for (const n of ['19', '15', '112', '177']) {
      expect(screen.getByLabelText(`Call ${n}`)).toBeTruthy();
    }
  });
});
