import { Figtree_400Regular, Figtree_500Medium, Figtree_600SemiBold, Figtree_700Bold } from '@expo-google-fonts/figtree';
import { NotoSansTifinagh_400Regular } from '@expo-google-fonts/noto-sans-tifinagh';
import { ReemKufi_600SemiBold, ReemKufi_700Bold } from '@expo-google-fonts/reem-kufi';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFonts } from 'expo-font';
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useMemo, useState } from 'react';
import 'react-native-reanimated';

import { useColorScheme } from '@/components/useColorScheme';
import { StartChoiceScreen } from '@/components/StartChoice';
import { WelcomeContext, WelcomeScreen } from '@/components/Welcome';
import { fonts, palette } from '@/constants/theme';
import { FavouritesProvider } from '@/lib/favourites';
import { GuideProvider } from '@/lib/guide';
import { setStartChoice } from '@/lib/nav';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

const WELCOME_SEEN_KEY = 'marhaba.welcomeSeen';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    ReemKufi_600SemiBold,
    ReemKufi_700Bold,
    Figtree_400Regular,
    Figtree_500Medium,
    Figtree_600SemiBold,
    Figtree_700Bold,
    NotoSansTifinagh_400Regular,
  });
  // null until we know whether this is the first launch.
  const [welcomeSeen, setWelcomeSeen] = useState<boolean | null>(null);
  // After "Get Started": choose between planning the trip (flights) or the tour (cities).
  const [choosing, setChoosing] = useState(false);

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    AsyncStorage.getItem(WELCOME_SEEN_KEY)
      .then((value) => setWelcomeSeen(value === '1'))
      .catch(() => setWelcomeSeen(false));
  }, []);

  const ready = loaded && welcomeSeen !== null;

  useEffect(() => {
    if (ready) {
      SplashScreen.hideAsync();
    }
  }, [ready]);

  const welcome = useMemo(() => ({ showWelcome: () => setWelcomeSeen(false) }), []);

  if (!ready) {
    return null;
  }

  if (!welcomeSeen && choosing) {
    return (
      <StartChoiceScreen
        onChoose={(choice) => {
          setStartChoice(choice);
          setChoosing(false);
          setWelcomeSeen(true);
          AsyncStorage.setItem(WELCOME_SEEN_KEY, '1').catch(() => {});
        }}
      />
    );
  }

  if (!welcomeSeen) {
    return <WelcomeScreen onStart={() => setChoosing(true)} />;
  }

  return (
    <WelcomeContext.Provider value={welcome}>
      <GuideProvider>
        <FavouritesProvider>
          <RootLayoutNav />
        </FavouritesProvider>
      </GuideProvider>
    </WelcomeContext.Provider>
  );
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        {/* The title names the back arrow on SOS and booking screens ("Marhaba, back"). */}
        <Stack.Screen name="(tabs)" options={{ headerShown: false, title: 'Marhaba' }} />
        {/* Opened from the red SOS button in Tools; the back arrow returns there. */}
        <Stack.Screen
          name="sos"
          options={{
            title: 'SOS',
            headerStyle: { backgroundColor: palette.majorelle },
            headerTintColor: '#FFFFFF',
            headerTitleStyle: { fontFamily: fonts.bold },
          }}
        />
        <Stack.Screen
          name="request/[id]"
          options={{
            title: 'Request to book',
            presentation: 'modal',
            headerStyle: { backgroundColor: palette.majorelle },
            headerTintColor: '#FFFFFF',
            headerTitleStyle: { fontFamily: fonts.bold },
          }}
        />
      </Stack>
    </ThemeProvider>
  );
}
