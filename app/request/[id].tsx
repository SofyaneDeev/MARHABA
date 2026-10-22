import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState, type ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import Animated, { FadeInDown, ZoomIn } from 'react-native-reanimated';

import { Lantern } from '@/components/Lantern';
import { PressableScale } from '@/components/PressableScale';
import { Card, Chip } from '@/components/ui';
import { GUIDE_REQUESTS_ENABLED } from '@/constants/features';
import { fonts, useThemeColors } from '@/constants/theme';
import {
  addDays,
  BookingError,
  fetchExperience,
  MAX_GROUP,
  sendBookingRequest,
  toIsoDate,
  validateRequest,
  type Experience,
  type FieldErrors,
} from '@/lib/bookings';

type Load = { status: 'loading' } | { status: 'missing' } | { status: 'error'; message: string } | { status: 'ready'; item: Experience };

const QUICK_DATES = [
  { label: 'Tomorrow', days: 1 },
  { label: 'In 3 days', days: 3 },
  { label: 'In a week', days: 7 },
];

export default function RequestScreen() {
  return GUIDE_REQUESTS_ENABLED ? <RequestLoader /> : <NotAvailableYet />;
}

/** Shown while guide requests are switched off (see constants/features.ts). */
function NotAvailableYet() {
  const c = useThemeColors();
  return (
    <View style={[styles.centered, { backgroundColor: c.background }]}>
      <Text style={[styles.heading, { color: c.text, textAlign: 'center' }]}>Guide requests are coming soon</Text>
      <Text style={[styles.body, { color: c.muted, textAlign: 'center' }]}>
        For now, book tours, riads and desert trips through the partner sites in the Book tab.
      </Text>
      <Pressable accessibilityRole="button" onPress={() => router.back()} style={styles.backLink}>
        <Text style={[styles.link, { color: c.primary }]}>Back to Book</Text>
      </Pressable>
    </View>
  );
}

function RequestLoader() {
  const c = useThemeColors();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [load, setLoad] = useState<Load>({ status: 'loading' });

  useEffect(() => {
    let cancelled = false;
    fetchExperience(String(id))
      .then((item) => {
        if (!cancelled) setLoad(item ? { status: 'ready', item } : { status: 'missing' });
      })
      .catch((e) => {
        if (!cancelled) setLoad({ status: 'error', message: e instanceof BookingError ? e.message : 'Something went wrong.' });
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (load.status === 'loading') {
    return (
      <View style={[styles.centered, { backgroundColor: c.background }]}>
        <Lantern label="Loading the experience…" />
      </View>
    );
  }
  if (load.status !== 'ready') {
    return (
      <View style={[styles.centered, { backgroundColor: c.background }]}>
        <Text style={[styles.body, { color: c.text, textAlign: 'center' }]}>
          {load.status === 'missing' ? 'This experience is no longer available.' : load.message}
        </Text>
        <Pressable accessibilityRole="button" onPress={() => router.back()} style={styles.backLink}>
          <Text style={[styles.link, { color: c.primary }]}>Back to Book</Text>
        </Pressable>
      </View>
    );
  }
  return <RequestForm item={load.item} />;
}

function RequestForm({ item }: { item: Experience }) {
  const c = useThemeColors();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [date, setDate] = useState('');
  const [groupSize, setGroupSize] = useState(2);
  const [message, setMessage] = useState('');
  const [consent, setConsent] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const input = { experienceId: item.id, name, email, whatsapp, date, groupSize, message, consent };

  async function submit() {
    const found = validateRequest(input);
    setErrors(found);
    setSendError(null);
    if (Object.keys(found).length > 0) return;

    setSending(true);
    try {
      await sendBookingRequest(input);
      setSent(true);
    } catch (e) {
      setSendError(e instanceof BookingError ? e.message : 'Something went wrong. Try again in a moment.');
    } finally {
      setSending(false);
    }
  }

  if (sent) {
    return (
      <ScrollView style={{ backgroundColor: c.background }} contentContainerStyle={styles.screen}>
        <Animated.View entering={FadeInDown.duration(400)} style={[styles.done, { backgroundColor: c.surface, borderColor: c.line }]}>
          <Animated.Text entering={ZoomIn.delay(200).springify()} style={[styles.doneMark, { color: c.mint }]}>
            ✓
          </Animated.Text>
          <Text style={[styles.heading, { color: c.text }]}>Request sent</Text>
          <Text style={[styles.body, { color: c.text, textAlign: 'center' }]}>
            {item.title} in {item.city} on {date} for {groupSize} {groupSize === 1 ? 'person' : 'people'}.
          </Text>
          <Text style={[styles.body, { color: c.muted, textAlign: 'center' }]}>
            Marhaba will email you at {email.trim()} to confirm availability and the final price. Nothing is charged
            now.
          </Text>
          <PressableScale accessibilityRole="button" onPress={() => router.back()} style={[styles.submit, { backgroundColor: c.primary }]}>
            <Text style={[styles.submitText, { color: c.onPrimary }]}>Back to Book</Text>
          </PressableScale>
        </Animated.View>
      </ScrollView>
    );
  }

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        style={{ backgroundColor: c.background }}
        contentContainerStyle={styles.screen}
        keyboardShouldPersistTaps="handled">
        <Card style={styles.summary}>
          <Text style={[styles.heading, { color: c.text }]}>{item.title}</Text>
          <Text style={[styles.body, { color: c.muted }]}>
            {[item.city, item.duration, item.price_from_mad != null ? `from ${item.price_from_mad} MAD` : null]
              .filter(Boolean)
              .join(' · ')}
          </Text>
          {item.is_sample ? (
            <Text style={[styles.sampleNote, { color: c.clay }]}>
              This is a sample listing. Your request is saved, but no guide is linked to it yet.
            </Text>
          ) : null}
        </Card>

        <Field label="Your name" error={errors.name}>
          <TextInput
            value={name}
            onChangeText={setName}
            autoComplete="name"
            accessibilityLabel="Your name"
            style={inputStyle(c, !!errors.name)}
          />
        </Field>

        <Field label="Email" error={errors.email}>
          <TextInput
            value={email}
            onChangeText={setEmail}
            autoComplete="email"
            keyboardType="email-address"
            autoCapitalize="none"
            accessibilityLabel="Email"
            placeholder="name@example.com"
            placeholderTextColor={c.muted}
            style={inputStyle(c, !!errors.email)}
          />
        </Field>

        <Field label="WhatsApp (optional)" error={errors.whatsapp}>
          <TextInput
            value={whatsapp}
            onChangeText={setWhatsapp}
            keyboardType="phone-pad"
            accessibilityLabel="WhatsApp number"
            placeholder="+44 7700 900123"
            placeholderTextColor={c.muted}
            style={inputStyle(c, !!errors.whatsapp)}
          />
        </Field>

        <Field label="Preferred date" error={errors.date}>
          <View style={styles.chips}>
            {QUICK_DATES.map((d) => {
              const value = toIsoDate(addDays(new Date(), d.days));
              return <Chip key={d.label} label={d.label} selected={date === value} onPress={() => setDate(value)} />;
            })}
          </View>
          <TextInput
            value={date}
            onChangeText={setDate}
            accessibilityLabel="Preferred date"
            placeholder="YYYY-MM-DD"
            placeholderTextColor={c.muted}
            style={inputStyle(c, !!errors.date)}
          />
        </Field>

        <Field label="Group size" error={errors.groupSize}>
          <View style={styles.stepper}>
            <StepButton label="−" accessibilityLabel="Fewer people" disabled={groupSize <= 1} onPress={() => setGroupSize((n) => n - 1)} />
            <Text style={[styles.count, { color: c.text }]} accessibilityLabel={`${groupSize} people`}>
              {groupSize} {groupSize === 1 ? 'person' : 'people'}
            </Text>
            <StepButton label="+" accessibilityLabel="More people" disabled={groupSize >= MAX_GROUP} onPress={() => setGroupSize((n) => n + 1)} />
          </View>
        </Field>

        <Field label="Message (optional)" error={errors.message}>
          <TextInput
            value={message}
            onChangeText={setMessage}
            multiline
            accessibilityLabel="Message"
            placeholder="Language, pick-up point, dietary needs…"
            placeholderTextColor={c.muted}
            style={[inputStyle(c, !!errors.message), styles.multiline]}
          />
        </Field>

        <Pressable
          accessibilityRole="checkbox"
          accessibilityState={{ checked: consent }}
          onPress={() => setConsent((v) => !v)}
          style={styles.consent}>
          <View style={[styles.box, { borderColor: errors.consent ? c.danger : c.muted, backgroundColor: consent ? c.primary : 'transparent' }]}>
            {consent ? <Text style={[styles.tick, { color: c.onPrimary }]}>✓</Text> : null}
          </View>
          <Text style={[styles.consentText, { color: c.text }]}>
            I agree that Marhaba stores my name and contact details to arrange this booking.
          </Text>
        </Pressable>
        {errors.consent ? <Text style={[styles.error, { color: c.danger }]}>{errors.consent}</Text> : null}

        {sendError ? <Text style={[styles.error, { color: c.danger }]}>{sendError}</Text> : null}

        <PressableScale
          accessibilityRole="button"
          disabled={sending}
          onPress={submit}
          style={[styles.submit, { backgroundColor: c.primary, opacity: sending ? 0.6 : 1 }]}>
          <Text style={[styles.submitText, { color: c.onPrimary }]}>{sending ? 'Sending…' : 'Send request'}</Text>
        </PressableScale>
        <Text style={[styles.small, { color: c.muted }]}>Free and without obligation. Nothing is charged now.</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: ReactNode }) {
  const c = useThemeColors();
  return (
    <View style={styles.field}>
      <Text style={[styles.label, { color: c.text }]}>{label}</Text>
      {children}
      {error ? <Text style={[styles.error, { color: c.danger }]}>{error}</Text> : null}
    </View>
  );
}

function StepButton({
  label,
  accessibilityLabel,
  disabled,
  onPress,
}: {
  label: string;
  accessibilityLabel: string;
  disabled: boolean;
  onPress: () => void;
}) {
  const c = useThemeColors();
  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      disabled={disabled}
      onPress={onPress}
      scaleTo={0.85}
      style={[styles.step, { borderColor: c.line, backgroundColor: c.surface, opacity: disabled ? 0.4 : 1 }]}>
      <Text style={[styles.stepText, { color: c.text }]}>{label}</Text>
    </PressableScale>
  );
}

function inputStyle(c: ReturnType<typeof useThemeColors>, invalid: boolean) {
  return [styles.input, { color: c.text, backgroundColor: c.surface, borderColor: invalid ? c.danger : c.line }];
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 12 },
  backLink: { padding: 8 },
  link: { fontFamily: fonts.semibold, fontSize: 15 },
  screen: { padding: 16, gap: 16 },
  summary: { padding: 14, gap: 4 },
  heading: { fontFamily: fonts.bold, fontSize: 18 },
  body: { fontFamily: fonts.body, fontSize: 14, lineHeight: 20 },
  sampleNote: { fontFamily: fonts.semibold, fontSize: 13, lineHeight: 18, marginTop: 4 },
  field: { gap: 6 },
  label: { fontFamily: fonts.semibold, fontSize: 14 },
  input: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontFamily: fonts.body, fontSize: 15 },
  multiline: { minHeight: 90, textAlignVertical: 'top' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  step: { width: 40, height: 40, borderRadius: 20, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  stepText: { fontFamily: fonts.bold, fontSize: 20 },
  count: { fontFamily: fonts.semibold, fontSize: 16, minWidth: 90, textAlign: 'center' },
  consent: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  box: { width: 22, height: 22, borderRadius: 6, borderWidth: 2, alignItems: 'center', justifyContent: 'center', marginTop: 1 },
  tick: { fontFamily: fonts.bold, fontSize: 14, lineHeight: 16 },
  consentText: { flex: 1, fontFamily: fonts.body, fontSize: 14, lineHeight: 20 },
  error: { fontFamily: fonts.medium, fontSize: 13 },
  submit: { borderRadius: 999, paddingVertical: 14, alignItems: 'center', alignSelf: 'stretch' },
  submitText: { fontFamily: fonts.bold, fontSize: 16 },
  small: { fontFamily: fonts.body, fontSize: 12.5, textAlign: 'center' },
  done: { borderWidth: 1, borderRadius: 16, padding: 20, gap: 10, alignItems: 'center' },
  doneMark: { fontFamily: fonts.bold, fontSize: 44 },
});
