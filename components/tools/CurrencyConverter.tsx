import { useEffect, useState } from 'react';
import { Linking, StyleSheet, Text, TextInput, View } from 'react-native';

import { Lantern } from '@/components/Lantern';
import { PressableScale } from '@/components/PressableScale';
import { Card, Chip } from '@/components/ui';
import { fonts, useThemeColors } from '@/constants/theme';
import { convert, CURRENCIES, formatMoney, loadRates, parseAmount, type Currency, type Rates } from '@/lib/currency';

/** Converts between dirhams and a traveller's home currency, using today's rates. */
export function CurrencyConverter() {
  const c = useThemeColors();
  const [rates, setRates] = useState<Rates | null | undefined>(undefined);
  const [currency, setCurrency] = useState<Currency>('EUR');
  const [amount, setAmount] = useState('100');
  const [toDirham, setToDirham] = useState(true);

  useEffect(() => {
    let cancelled = false;
    loadRates().then((r) => {
      if (!cancelled) setRates(r);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const value = parseAmount(amount);
  const from: Currency | 'MAD' = toDirham ? currency : 'MAD';
  const to: Currency | 'MAD' = toDirham ? 'MAD' : currency;
  const result = rates && Number.isFinite(value) ? convert(value, rates.perDirham[currency], toDirham) : null;

  return (
    <Card style={styles.card}>
      <Text style={[styles.title, { color: c.text }]}>Currency converter</Text>
      <Text style={[styles.body, { color: c.muted }]}>Check souk and taxi prices against your own money.</Text>

      <View style={styles.chips}>
        {CURRENCIES.map((code) => (
          <Chip key={code} label={code} selected={code === currency} onPress={() => setCurrency(code)} />
        ))}
      </View>

      {rates === undefined ? (
        <Lantern label="Getting today’s rates…" size={48} />
      ) : rates === null ? (
        <Text style={[styles.body, { color: c.text }]}>
          Connect to the internet once to load exchange rates. After that, the converter also works offline.
        </Text>
      ) : (
        <>
          <View style={styles.inputRow}>
            <TextInput
              value={amount}
              onChangeText={setAmount}
              keyboardType="decimal-pad"
              accessibilityLabel={`Amount in ${from}`}
              style={[styles.input, { color: c.text, borderColor: c.line, backgroundColor: c.background }]}
            />
            <Text style={[styles.code, { color: c.text }]}>{from}</Text>
            <PressableScale
              accessibilityRole="button"
              accessibilityLabel="Swap currencies"
              onPress={() => setToDirham((v) => !v)}
              scaleTo={0.85}
              style={[styles.swap, { backgroundColor: c.surfaceAlt }]}>
              <Text style={[styles.swapText, { color: c.primary }]}>⇄</Text>
            </PressableScale>
          </View>
          <Text style={[styles.result, { color: c.primary }]} accessibilityLiveRegion="polite">
            {result === null ? `Enter an amount in ${from}` : `= ${formatMoney(result, to)}`}
          </Text>
          <Text style={[styles.small, { color: c.muted }]}>
            1 {currency} = {formatMoney(1 / rates.perDirham[currency], 'MAD')} · rates from {rates.updatedUtc.slice(5, 16) || 'today'}
            . Banks and exchange offices add their own margin.
          </Text>
          <PressableScale
            accessibilityRole="link"
            haptic={false}
            onPress={() => Linking.openURL('https://www.exchangerate-api.com').catch(() => {})}
            style={styles.attribution}>
            <Text style={[styles.small, { color: c.primary }]}>Rates by Exchange Rate API ↗</Text>
          </PressableScale>
        </>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { padding: 14, gap: 10 },
  title: { fontFamily: fonts.bold, fontSize: 17 },
  body: { fontFamily: fonts.body, fontSize: 14, lineHeight: 20 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  inputRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  input: { flex: 1, minWidth: 0, borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontFamily: fonts.semibold, fontSize: 20 },
  code: { fontFamily: fonts.bold, fontSize: 16, minWidth: 40 },
  swap: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  swapText: { fontSize: 20, fontFamily: fonts.bold },
  result: { fontFamily: fonts.display, fontSize: 28 },
  small: { fontFamily: fonts.body, fontSize: 12.5, lineHeight: 18 },
  attribution: { alignSelf: 'flex-start' },
});
