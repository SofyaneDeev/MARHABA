import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { fonts, useThemeColors } from '@/constants/theme';

const WEEKDAYS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const iso = (y: number, m: number, d: number) => `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

/**
 * A month calendar. Days before `min` (YYYY-MM-DD) can't be chosen.
 * `value` is the chosen day, `rangeStart` shades the days between it and `value`.
 */
export function CalendarPicker({
  value,
  min,
  rangeStart,
  onChange,
}: {
  value?: string;
  min: string;
  rangeStart?: string;
  onChange: (day: string) => void;
}) {
  const c = useThemeColors();
  const start = (value ?? min).split('-').map(Number);
  const [month, setMonth] = useState({ y: start[0], m: start[1] - 1 });
  const [minY, minM] = min.split('-').map(Number);
  const canGoBack = month.y > minY || (month.y === minY && month.m > minM - 1);

  const first = new Date(month.y, month.m, 1);
  const lead = (first.getDay() + 6) % 7; // Monday first
  const days = new Date(month.y, month.m + 1, 0).getDate();
  const cells: (number | null)[] = [...Array(lead).fill(null), ...Array.from({ length: days }, (_, i) => i + 1)];
  while (cells.length % 7) cells.push(null);

  const move = (step: number) =>
    setMonth(({ y, m }) => {
      const n = m + step;
      return { y: y + Math.floor(n / 12), m: ((n % 12) + 12) % 12 };
    });

  return (
    <View style={[styles.box, { borderColor: c.line, backgroundColor: c.surface }]}>
      <View style={styles.head}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Previous month"
          disabled={!canGoBack}
          onPress={() => move(-1)}
          hitSlop={10}
          style={[styles.arrow, { opacity: canGoBack ? 1 : 0.3 }]}>
          <Text style={[styles.arrowText, { color: c.primary }]}>‹</Text>
        </Pressable>
        <Text style={[styles.month, { color: c.text }]}>
          {MONTHS[month.m]} {month.y}
        </Text>
        <Pressable accessibilityRole="button" accessibilityLabel="Next month" onPress={() => move(1)} hitSlop={10} style={styles.arrow}>
          <Text style={[styles.arrowText, { color: c.primary }]}>›</Text>
        </Pressable>
      </View>
      <View style={styles.row}>
        {WEEKDAYS.map((w) => (
          <Text key={w} style={[styles.weekday, { color: c.muted }]}>
            {w}
          </Text>
        ))}
      </View>
      <View style={styles.grid}>
        {cells.map((d, i) => {
          if (d === null) return <View key={`e${i}`} style={styles.cell} />;
          const day = iso(month.y, month.m, d);
          const past = day < min;
          const chosen = day === value || day === rangeStart;
          const between = !!(rangeStart && value && day > rangeStart && day < value);
          return (
            <Pressable
              key={day}
              accessibilityRole="button"
              accessibilityLabel={`${d} ${MONTHS[month.m]} ${month.y}`}
              accessibilityState={{ selected: chosen, disabled: past }}
              disabled={past}
              onPress={() => onChange(day)}
              style={styles.cell}>
              <View
                style={[
                  styles.day,
                  between && { backgroundColor: c.surfaceAlt },
                  chosen && { backgroundColor: c.primary },
                ]}>
                <Text style={[styles.dayText, { color: chosen ? c.onPrimary : past ? c.line : c.text }]}>{d}</Text>
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  box: { borderWidth: 1, borderRadius: 14, padding: 10, gap: 4 },
  head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 4 },
  arrow: { paddingHorizontal: 10, paddingVertical: 2 },
  arrowText: { fontFamily: fonts.bold, fontSize: 26, lineHeight: 30 },
  month: { fontFamily: fonts.semibold, fontSize: 16 },
  row: { flexDirection: 'row' },
  weekday: { flex: 1, textAlign: 'center', fontFamily: fonts.semibold, fontSize: 12, paddingVertical: 4 },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  cell: { width: '14.2857%', aspectRatio: 1, padding: 2 },
  day: { flex: 1, borderRadius: 999, alignItems: 'center', justifyContent: 'center' },
  dayText: { fontFamily: fonts.medium, fontSize: 15 },
});
