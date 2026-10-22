/**
 * Companies the Book tab links to. `logo` is the image shown on the tile; the brand
 * colour and `mark` are the fallback when there is no image.
 *
 * The logo images in assets/logos were cut from an AI-made sheet supplied by the app owner,
 * not taken from the companies. Replace each file with the company's official logo (same
 * file name, square PNG, 256x256 or larger) when you get it, e.g. through a partner programme.
 */
export type ProviderId =
  | 'booking'
  | 'airbnb'
  | 'getyourguide'
  | 'viator'
  | 'oncf'
  | 'ctm'
  | 'indrive'
  | 'careem'
  | 'uber'
  | 'heetch'
  | 'yango'
  | 'glovo'
  | 'kooul'
  | 'yassir';

export type Provider = {
  name: string;
  /** Tile background and the letters on it. */
  color: string;
  ink: string;
  mark: string;
  /** Optional logo image (require(...)), shown on white instead of the letters. */
  logo?: number;
};

export const providers: Record<ProviderId, Provider> = {
  booking: { name: 'Booking.com', color: '#003580', ink: '#FFFFFF', mark: 'B.', logo: require('@/assets/logos/booking.png') },
  airbnb: { name: 'Airbnb', color: '#FF5A5F', ink: '#FFFFFF', mark: 'A', logo: require('@/assets/logos/airbnb.png') },
  getyourguide: { name: 'GetYourGuide', color: '#FF5533', ink: '#FFFFFF', mark: 'GYG', logo: require('@/assets/logos/getyourguide.png') },
  viator: { name: 'Viator', color: '#186B6D', ink: '#FFFFFF', mark: 'V', logo: require('@/assets/logos/viator.png') },
  oncf: { name: 'ONCF', color: '#F28C00', ink: '#FFFFFF', mark: 'ONCF', logo: require('@/assets/logos/oncf.png') },
  ctm: { name: 'CTM', color: '#C8102E', ink: '#FFFFFF', mark: 'CTM', logo: require('@/assets/logos/ctm.png') },
  indrive: { name: 'inDrive', color: '#C1F11D', ink: '#141414', mark: 'iD', logo: require('@/assets/logos/indrive.png') },
  careem: { name: 'Careem', color: '#00B26B', ink: '#FFFFFF', mark: 'C', logo: require('@/assets/logos/careem.png') },
  uber: { name: 'Uber', color: '#000000', ink: '#FFFFFF', mark: 'U', logo: require('@/assets/logos/uber.png') },
  heetch: { name: 'Heetch', color: '#F7287A', ink: '#FFFFFF', mark: 'H', logo: require('@/assets/logos/heetch.png') },
  yango: { name: 'Yango', color: '#FF2B2B', ink: '#FFFFFF', mark: 'Y', logo: require('@/assets/logos/yango.png') },
  glovo: { name: 'Glovo', color: '#FFC244', ink: '#00A082', mark: 'G', logo: require('@/assets/logos/glovo.png') },
  kooul: { name: 'Kooul', color: '#E8572A', ink: '#FFFFFF', mark: 'K', logo: require('@/assets/logos/kooul.png') },
  yassir: { name: 'Yassir', color: '#6B2CF5', ink: '#FFFFFF', mark: 'Y', logo: require('@/assets/logos/yassir.png') },
};
