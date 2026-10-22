// A small stand-in for react-native-reanimated in Jest: every animation jumps
// straight to its final value, so tests check what is shown, not the motion.
import type { ComponentType } from 'react';
import { Image, Text, View } from 'react-native';

/** A layout-animation preset (FadeInDown, ZoomIn…) whose modifiers can be chained. */
function preset(): unknown {
  const chain: Record<string, unknown> = {};
  for (const name of ['delay', 'duration', 'springify', 'damping', 'stiffness', 'easing', 'withInitialValues', 'reduceMotion']) {
    chain[name] = () => chain;
  }
  return chain;
}

const createAnimatedComponent = <P,>(component: ComponentType<P>) => component;
const identity = <T,>(value: T) => value;

const Easing = new Proxy({}, { get: () => (..._args: unknown[]) => (t: number) => t });

const Animated = { View, Text, Image, createAnimatedComponent };

module.exports = {
  __esModule: true,
  default: Animated,
  ...Animated,
  useSharedValue: <T,>(initial: T) => {
    let value = initial;
    return {
      get: () => value,
      set: (next: T) => {
        value = next;
      },
      get value() {
        return value;
      },
    };
  },
  useAnimatedStyle: () => ({}),
  useAnimatedProps: () => ({}),
  useReducedMotion: () => false,
  withTiming: identity,
  withSpring: identity,
  withDelay: (_ms: number, value: unknown) => value,
  withRepeat: identity,
  withSequence: (...values: unknown[]) => values[values.length - 1],
  cancelAnimation: () => {},
  Easing,
  FadeIn: preset(),
  FadeInDown: preset(),
  FadeInUp: preset(),
  FadeOut: preset(),
  ZoomIn: preset(),
  SlideInLeft: preset(),
  SlideInRight: preset(),
  LinearTransition: preset(),
};
