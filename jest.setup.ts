// In-memory AsyncStorage for tests (the real one needs a device).
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

// Reanimated needs native code; in tests every animation jumps to its end state.
jest.mock('react-native-reanimated', () => require('./test-utils/reanimatedMock'));

// Speech and haptics talk to the device; tests only check they are called.
jest.mock('expo-speech', () => ({
  speak: jest.fn(),
  stop: jest.fn(() => Promise.resolve()),
  getAvailableVoicesAsync: jest.fn(() => Promise.resolve([{ identifier: 'ar', language: 'ar-SA', name: 'Arabic', quality: 'Default' }])),
}));
jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(() => Promise.resolve()),
  ImpactFeedbackStyle: { Light: 'light', Medium: 'medium' },
}));
