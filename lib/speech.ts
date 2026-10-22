import * as Speech from 'expo-speech';

let arabicVoice: Promise<string | null> | null = null;

/** The language code of an Arabic voice on this device, preferring Moroccan Arabic (ar-MA). */
export function findArabicVoice(): Promise<string | null> {
  arabicVoice ??= Speech.getAvailableVoicesAsync()
    .then((voices) => {
      const arabic = voices.filter((v) => v.language?.toLowerCase().startsWith('ar'));
      return (arabic.find((v) => v.language.toLowerCase() === 'ar-ma') ?? arabic[0])?.language ?? null;
    })
    .catch(() => null);
  return arabicVoice;
}

/** Reads Arabic text aloud, a little slower than normal so it's easier to repeat. */
export function speakArabic(text: string, language: string | null) {
  Speech.stop().catch(() => {});
  // Drop punctuation the voice would read out or pause on.
  Speech.speak(text.replace(/[…؟?!]/g, '').trim(), { language: language ?? 'ar', rate: 0.85 });
}
