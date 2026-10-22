import { Platform } from 'react-native';

import type { ProviderId } from '@/data/providers';

/**
 * Third-party apps travellers can use in Morocco. Availability changes city by
 * city and over time (checked October 2026), so the app always says to check
 * in the app itself. Links go to each company's own site or store page.
 */
export type LocalApp = {
  provider: ProviderId;
  name: string;
  what: string;
  /** Official website. */
  url: string;
  /** Store pages, when the app has no useful website. */
  iosUrl?: string;
  androidUrl?: string;
};

export type AppGroup = {
  id: 'rides' | 'food';
  title: string;
  description: string;
  tip: string;
  apps: LocalApp[];
};

export const appGroups: AppGroup[] = [
  {
    id: 'rides',
    title: 'Ride apps',
    description: 'Order a car from your phone, with the price shown before you ride.',
    tip: 'Rules for ride apps in Morocco are still being settled, and many drivers use private cars. Metered petit taxis are the official option in cities. In any car, check the plate and share your trip with someone.',
    apps: [
      { provider: 'indrive', name: 'inDrive', what: 'You suggest a fare and nearby drivers accept or reply with theirs. The widest coverage, including smaller cities.', url: 'https://indrive.com' },
      { provider: 'careem', name: 'Careem', what: 'Rides with an upfront price, strongest in Casablanca, Rabat and Marrakech.', url: 'https://www.careem.com' },
      { provider: 'uber', name: 'Uber', what: 'Back since late 2025 in some big cities, with licensed tourist-transport drivers.', url: 'https://www.uber.com' },
      { provider: 'heetch', name: 'Heetch', what: 'Rides with an upfront price, mainly in Casablanca and Rabat.', url: 'https://www.heetch.com' },
      { provider: 'yango', name: 'Yango', what: 'Rides with an upfront price in the biggest cities.', url: 'https://yango.com' },
    ],
  },
  {
    id: 'food',
    title: 'Food delivery',
    description: 'Meals, groceries and shop items brought to your riad or hotel.',
    tip: 'Delivery works in cities, not in desert camps or mountain villages. Give couriers a landmark: medina addresses are hard to find, so meeting at the nearest gate often helps. Many orders are paid in cash.',
    apps: [
      { provider: 'glovo', name: 'Glovo', what: 'The biggest delivery app in Morocco: restaurants, groceries and shops in 30+ cities.', url: 'https://glovoapp.com' },
      {
        provider: 'kooul',
        name: 'Kooul',
        what: 'A Moroccan delivery app in the big cities, including Casablanca, Rabat, Marrakech and Agadir.',
        url: 'https://play.google.com/store/apps/details?id=com.ora.customer',
        iosUrl: 'https://apps.apple.com/app/kooul-food-delivery/id6502602776',
        androidUrl: 'https://play.google.com/store/apps/details?id=com.ora.customer',
      },
      { provider: 'yassir', name: 'Yassir', what: 'A super-app with food delivery and rides.', url: 'https://yassir.com' },
    ],
  },
];

/** The best link for this device: its app store page if known, else the website. */
export function appLink(app: LocalApp, os: string = Platform.OS): string {
  if (os === 'ios' && app.iosUrl) return app.iosUrl;
  if (os === 'android' && app.androidUrl) return app.androidUrl;
  return app.url;
}
