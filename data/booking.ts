import type { SymbolViewProps } from 'expo-symbols';

import { appGroups, appLink } from '@/data/apps';
import type { City } from '@/data/cities';
import type { ProviderId } from '@/data/providers';

/** One way to book: a trusted company and what it opens. Marhaba only opens the page. */
export type BookingOption = {
  provider: ProviderId;
  title: string;
  subtitle: string;
  url: string;
};

export type CategoryId = 'stay' | 'tours' | 'culture' | 'desert' | 'transport' | 'rides' | 'food';

export type BookingCategory = {
  id: CategoryId;
  /** Short name on the grid tile. */
  label: string;
  icon: SymbolViewProps['name'];
  title: string;
  description: string;
  tip: string;
  options: BookingOption[];
};

const q = (text: string) => encodeURIComponent(text);

const booking = (search: string) => `https://www.booking.com/searchresults.html?ss=${q(search)}`;
const airbnb = (search: string) => `https://www.airbnb.com/s/${q(search)}/homes`;
const getYourGuide = (search: string) => `https://www.getyourguide.com/s/?q=${q(search)}`;
const viator = (search: string) => `https://www.viator.com/searchResults/all?text=${q(search)}`;

function appOptions(groupId: 'rides' | 'food'): BookingOption[] {
  const group = appGroups.find((g) => g.id === groupId)!;
  return group.apps.map((app) => ({ provider: app.provider, title: app.name, subtitle: app.what, url: appLink(app) }));
}

function appTip(groupId: 'rides' | 'food'): string {
  return appGroups.find((g) => g.id === groupId)!.tip;
}

/** Every booking category for one city, with searches already filled in for it. */
export function bookingCategories(city: City): BookingCategory[] {
  const place = `${city.name}, Morocco`;
  return [
    {
      id: 'stay',
      label: 'Stays',
      icon: { ios: 'bed.double.fill', android: 'hotel', web: 'hotel' },
      title: `Stays in ${city.name}`,
      description: 'Riads, hotels and homes.',
      tip: 'A riad is a traditional house built around a courtyard. Many are deep in the medina where cars can’t go, so ask the riad to meet you at the nearest gate.',
      options: [
        { provider: 'booking', title: 'Booking.com', subtitle: `Riads and hotels in ${city.name}`, url: booking(`riad ${place}`) },
        { provider: 'airbnb', title: 'Airbnb', subtitle: `Homes and riads in ${city.name}`, url: airbnb(place) },
      ],
    },
    {
      id: 'tours',
      label: 'Tours',
      icon: { ios: 'map.fill', android: 'tour', web: 'tour' },
      title: `Tours in ${city.name}`,
      description: 'Walking tours, day trips and licensed guides.',
      tip: 'Only book official guides. Licensed guides carry a badge; people who offer to “show you the way” in the street are not guides.',
      options: [
        { provider: 'getyourguide', title: 'GetYourGuide', subtitle: `Tours and day trips from ${city.name}`, url: getYourGuide(`${city.name} tour`) },
        { provider: 'viator', title: 'Viator', subtitle: `Tours and guides in ${city.name}`, url: viator(`${city.name} tour`) },
      ],
    },
    {
      id: 'culture',
      label: 'Food & culture',
      icon: { ios: 'fork.knife', android: 'restaurant', web: 'restaurant' },
      title: 'Food & culture',
      description: 'Cooking classes, hammams and food tours.',
      tip: 'A local hammam costs little but bring your own towel and soap. Spa hammams are pricier and include everything.',
      options: [
        { provider: 'getyourguide', title: 'Cooking classes', subtitle: 'Cook a tagine with a local family or chef', url: getYourGuide(`${city.name} cooking class`) },
        { provider: 'getyourguide', title: 'Hammam & spa', subtitle: 'Traditional steam bath and scrub', url: getYourGuide(`${city.name} hammam`) },
        { provider: 'viator', title: 'Food tours', subtitle: 'Street food and markets with a guide', url: viator(`${city.name} food tour`) },
      ],
    },
    {
      id: 'desert',
      label: 'Desert',
      icon: { ios: 'sun.max.fill', android: 'wb_sunny', web: 'wb_sunny' },
      title: 'Desert trips',
      description: 'Nights in the Sahara at Merzouga (Erg Chebbi) or Zagora.',
      tip: 'From Marrakech, a trip to Merzouga takes at least 3 days because the drive is long. Zagora is closer but the dunes are smaller.',
      options: [
        { provider: 'getyourguide', title: 'GetYourGuide', subtitle: `Sahara tours from ${city.name}`, url: getYourGuide(`Sahara desert tour from ${city.name}`) },
        { provider: 'viator', title: 'Viator', subtitle: `Merzouga trips from ${city.name}`, url: viator(`Merzouga desert tour from ${city.name}`) },
      ],
    },
    {
      id: 'transport',
      label: 'Trains & buses',
      icon: { ios: 'tram.fill', android: 'train', web: 'train' },
      title: 'Trains & buses',
      description: 'Travel between cities with the national companies.',
      tip: 'ONCF runs the trains, including the Al Boraq high-speed line between Tangier, Rabat and Casablanca. CTM runs comfortable long-distance buses.',
      options: [
        { provider: 'oncf', title: 'ONCF', subtitle: 'National trains, including Al Boraq', url: 'https://www.oncf-voyages.ma' },
        { provider: 'ctm', title: 'CTM', subtitle: 'Long-distance buses across Morocco', url: 'https://www.ctm.ma' },
      ],
    },
    {
      id: 'rides',
      label: 'Rides',
      icon: { ios: 'car.fill', android: 'local_taxi', web: 'local_taxi' },
      title: 'Ride apps',
      description: 'Order a car with the price shown before you ride.',
      tip: appTip('rides'),
      options: appOptions('rides'),
    },
    {
      id: 'food',
      label: 'Delivery',
      icon: { ios: 'bag.fill', android: 'delivery_dining', web: 'delivery_dining' },
      title: 'Food delivery',
      description: 'Meals, groceries and shop items brought to you.',
      tip: appTip('food'),
      options: appOptions('food'),
    },
  ];
}
