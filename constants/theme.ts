import { useColorScheme } from '@/components/useColorScheme';

/** Palette taken from zellige tilework: Majorelle blue, saffron, mint tea. */
export const palette = {
  majorelle: '#2443B8',
  saffron: '#E0A21A',
  mint: '#2F8A63',
};

const light = {
  background: '#F4F5FB',
  surface: '#FFFFFF',
  surfaceAlt: '#E9ECF7',
  text: '#171A2E',
  muted: '#5D6280',
  line: '#DDE0EE',
  primary: palette.majorelle,
  onPrimary: '#FFFFFF',
  bubbleUser: palette.majorelle,
  saffron: palette.saffron,
  mint: palette.mint,
  clay: '#B5562F',
  leaf: '#3C8D3A',
  night: '#6B4FBF',
  danger: '#C2372B',
  dangerSoft: '#FBE7E5',
};

const dark: typeof light = {
  background: '#0C0F1F',
  surface: '#161A2F',
  surfaceAlt: '#1D2240',
  text: '#ECEEFA',
  muted: '#A2A7C6',
  line: '#2B3157',
  primary: '#7D95FF',
  onPrimary: '#0C0F1F',
  bubbleUser: '#3552D1',
  saffron: '#F1BB45',
  mint: '#5CC597',
  clay: '#E08A63',
  leaf: '#7FCB79',
  night: '#A996F0',
  danger: '#FF7B6E',
  dangerSoft: '#3A1E22',
};

export type ThemeColors = typeof light;

export function useThemeColors(): ThemeColors {
  return useColorScheme() === 'dark' ? dark : light;
}

/** Font family names, as loaded in app/_layout.tsx. */
export const fonts = {
  display: 'ReemKufi_700Bold',
  displaySemi: 'ReemKufi_600SemiBold',
  body: 'Figtree_400Regular',
  medium: 'Figtree_500Medium',
  semibold: 'Figtree_600SemiBold',
  bold: 'Figtree_700Bold',
  tifinagh: 'NotoSansTifinagh_400Regular',
};
