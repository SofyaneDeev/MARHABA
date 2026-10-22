import { Image, StyleSheet, Text, View } from 'react-native';

import { fonts } from '@/constants/theme';
import { providers, type ProviderId } from '@/data/providers';

/**
 * An app-icon style tile for a company: its logo on white if there is one,
 * otherwise its initials on its brand colour.
 */
export function LogoTile({ provider, size = 48 }: { provider: ProviderId; size?: number }) {
  const p = providers[provider];
  const radius = size * 0.26;
  // Longer marks (GYG, ONCF) get smaller letters so they fit.
  const fontSize = size * (p.mark.length >= 4 ? 0.24 : p.mark.length === 3 ? 0.3 : 0.42);

  return (
    <View
      style={[
        styles.tile,
        { width: size, height: size, borderRadius: radius },
        // Logos sit on white, like app icons, in both light and dark mode.
        p.logo ? styles.logoTile : { backgroundColor: p.color },
      ]}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants">
      {p.logo ? (
        <Image source={p.logo} style={{ width: size, height: size }} resizeMode="contain" />
      ) : (
        <Text style={[styles.mark, { color: p.ink, fontSize }]} numberOfLines={1}>
          {p.mark}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  tile: { alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  logoTile: { backgroundColor: '#FFFFFF', borderWidth: StyleSheet.hairlineWidth, borderColor: 'rgba(0,0,0,0.12)' },
  mark: { fontFamily: fonts.bold, letterSpacing: -0.3 },
});
