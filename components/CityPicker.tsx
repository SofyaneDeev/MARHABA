import { ScrollView, StyleSheet } from 'react-native';

import { Chip } from '@/components/ui';
import type { City } from '@/data/cities';
import { useGuide } from '@/lib/guide';

/** A horizontal row of city chips, from the guide currently shown. */
export function CityPicker({ value, onChange }: { value: City; onChange: (city: City) => void }) {
  const { cities } = useGuide();
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
      accessibilityLabel="Choose a city">
      {cities.map((city) => (
        <Chip key={city.name} label={city.name} selected={city.name === value.name} onPress={() => onChange(city)} />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: { gap: 6 },
});
