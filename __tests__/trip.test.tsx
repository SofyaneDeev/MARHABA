import { fireEvent, render, screen } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import TripScreen from '@/app/(tabs)/index';
import { StartChoiceScreen } from '@/components/StartChoice';
import { airports, googleFlightsUrl, kayakUrl, origins, skyscannerUrl, todayIso } from '@/data/flights';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const rak = airports.find((a) => a.code === 'RAK')!;
const paris = origins.find((o) => o.code === 'PAR')!;

describe('flight links', () => {
  it('builds a Google Flights search with or without an origin', () => {
    const url = decodeURIComponent(googleFlightsUrl({ to: rak, depart: '2026-11-05', ret: '2026-11-12', from: 'Brussels' }));
    expect(url).toContain('Flights to RAK from Brussels on 2026-11-05 returning 2026-11-12');
    expect(decodeURIComponent(googleFlightsUrl({ to: rak, depart: '2026-11-05' }))).toContain('one way');
  });

  it('only offers Kayak and Skyscanner when the origin is known', () => {
    expect(kayakUrl({ to: rak, depart: '2026-11-05' })).toBeNull();
    expect(skyscannerUrl({ to: rak, depart: '2026-11-05', from: 'Somewhere' })).toBeNull();
    expect(kayakUrl({ to: rak, depart: '2026-11-05', ret: '2026-11-12', from: paris })).toBe(
      'https://www.kayak.com/flights/PAR-RAK/2026-11-05/2026-11-12',
    );
    expect(skyscannerUrl({ to: rak, depart: '2026-11-05', from: paris })).toBe(
      'https://www.skyscanner.net/transport/flights/pari/rak/261105/',
    );
  });
});

describe('Trip', () => {
  it('asks for the landing city and date, then shows flight links', async () => {
    await render(<TripScreen />);
    expect(screen.getByText('Plan your trip')).toBeTruthy();
    expect(screen.getByText('Choose a city and your dates to see flights.')).toBeTruthy();

    await fireEvent.press(screen.getByText('Marrakech · RAK'));
    expect(screen.getByText('Marrakech Menara airport (RAK)')).toBeTruthy();

    await fireEvent.press(screen.getByText('One way'));
    // The arrival calendar is already open.
    const [y, m, d] = todayIso().split('-').map(Number);
    await fireEvent.press(screen.getByLabelText(`${d} ${MONTHS[m - 1]} ${y}`));

    expect(screen.getByLabelText('Open Google Flights')).toBeTruthy();
    expect(screen.getByText('Plan my tour in Marrakech →')).toBeTruthy();
  });
});

describe('Start choice', () => {
  it('lets the traveller plan the trip or the tour', async () => {
    const onChoose = jest.fn();
    await render(
      <SafeAreaProvider initialMetrics={{ frame: { x: 0, y: 0, width: 375, height: 812 }, insets: { top: 0, left: 0, right: 0, bottom: 0 } }}>
        <StartChoiceScreen onChoose={onChoose} />
      </SafeAreaProvider>,
    );
    await fireEvent.press(screen.getByLabelText('Plan my tour'));
    expect(onChoose).toHaveBeenCalledWith('tour');
    await fireEvent.press(screen.getByLabelText('Plan my trip'));
    expect(onChoose).toHaveBeenCalledWith('trip');
  });
});
