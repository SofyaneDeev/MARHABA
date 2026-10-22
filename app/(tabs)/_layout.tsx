import { SymbolView, type SymbolViewProps } from 'expo-symbols';
import { Tabs } from 'expo-router';
import { Pressable, StyleSheet, Text, View, type ColorValue } from 'react-native';

import { useClientOnlyValue } from '@/components/useClientOnlyValue';
import { useWelcome } from '@/components/Welcome';
import { ZelligePattern } from '@/components/Zellige';
import { fonts, palette, useThemeColors } from '@/constants/theme';

function TabIcon({ name, color }: { name: SymbolViewProps['name']; color: ColorValue }) {
  return <SymbolView name={name} tintColor={color} size={24} />;
}

function HeaderTitle() {
  return (
    <View>
      <Text style={styles.brand}>Marhaba</Text>
      <Text style={styles.tagline}>Your Morocco travel companion</Text>
    </View>
  );
}

function HeaderArabic() {
  const { showWelcome } = useWelcome();
  return (
    <Pressable accessibilityRole="button" accessibilityLabel="Show the welcome screen" onPress={showWelcome} hitSlop={8}>
      <Text style={styles.arabic}>مرحبا</Text>
    </Pressable>
  );
}

function HeaderBackground() {
  return (
    <View style={styles.headerBg}>
      <ZelligePattern id="header-zellige" opacity={0.1} size={40} />
    </View>
  );
}

export default function TabLayout() {
  const c = useThemeColors();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: c.primary,
        tabBarInactiveTintColor: c.muted,
        tabBarStyle: { backgroundColor: c.surface, borderTopColor: c.line },
        tabBarLabelStyle: { fontFamily: fonts.semibold },
        headerBackground: () => <HeaderBackground />,
        headerTintColor: '#FFFFFF',
        headerTitle: () => <HeaderTitle />,
        headerTitleAlign: 'left',
        headerRight: () => <HeaderArabic />,
        sceneStyle: { backgroundColor: c.background },
        // Disable the static render of the header on web
        // to prevent a hydration error in React Navigation.
        headerShown: useClientOnlyValue(false, true),
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Ask',
          tabBarIcon: ({ color }) => (
            <TabIcon name={{ ios: 'bubble.left.and.bubble.right', android: 'chat', web: 'chat' }} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="medina"
        options={{
          title: 'Cities',
          tabBarIcon: ({ color }) => (
            <TabIcon name={{ ios: 'mappin.and.ellipse', android: 'location_on', web: 'location_on' }} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="book"
        options={{
          title: 'Book',
          tabBarIcon: ({ color }) => (
            <TabIcon name={{ ios: 'bed.double', android: 'hotel', web: 'hotel' }} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="phrases"
        options={{
          title: 'Phrases',
          tabBarIcon: ({ color }) => (
            <TabIcon name={{ ios: 'character.bubble', android: 'translate', web: 'translate' }} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="tools"
        options={{
          title: 'Tools',
          tabBarIcon: ({ color }) => (
            <TabIcon name={{ ios: 'square.grid.2x2', android: 'apps', web: 'apps' }} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  headerBg: { flex: 1, backgroundColor: palette.majorelle, overflow: 'hidden' },
  brand: { fontFamily: fonts.display, fontSize: 22, color: '#FFFFFF', lineHeight: 26 },
  tagline: { fontFamily: fonts.body, fontSize: 12, color: 'rgba(255,255,255,0.8)' },
  arabic: { fontFamily: fonts.display, fontSize: 22, color: 'rgba(255,255,255,0.85)', marginRight: 16 },
});
