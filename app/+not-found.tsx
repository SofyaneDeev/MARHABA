import { Link, Stack } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { fonts, useThemeColors } from '@/constants/theme';

export default function NotFoundScreen() {
  const c = useThemeColors();
  return (
    <>
      <Stack.Screen options={{ title: 'Page not found' }} />
      <View style={[styles.container, { backgroundColor: c.background }]}>
        <Text style={[styles.title, { color: c.text }]}>This page doesn’t exist.</Text>
        <Link href="/" style={[styles.link, { color: c.primary }]}>
          Back to Marhaba
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 },
  title: { fontFamily: fonts.bold, fontSize: 20 },
  link: { marginTop: 15, paddingVertical: 15, fontFamily: fonts.semibold, fontSize: 15 },
});
