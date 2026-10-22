import { useCallback, useEffect, useRef, useState, type ComponentRef, type RefObject } from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import Animated, { SlideInLeft, SlideInRight } from 'react-native-reanimated';

import { GlideIn } from '@/components/GlideIn';
import { GuideAvatar, GuideBar, GuideHero } from '@/components/Guide';
import { PressableScale } from '@/components/PressableScale';
import { TypingDots } from '@/components/TypingDots';
import { Chip, SectionLabel } from '@/components/ui';
import { fonts, useThemeColors } from '@/constants/theme';
import { askMarhaba, ChatError, type ChatMessage } from '@/lib/chat';
import { formatReply } from '@/lib/formatReply';

const SUGGESTIONS = [
  'Is 300 MAD fair for a small leather bag?',
  'How do I get from Fes to Merzouga?',
  'What should I wear in the medina?',
  'How much should a petit taxi cost in Marrakech?',
  'How do I say no to fake guides politely?',
  'Plan 3 days in Chefchaouen',
];

const WELCOME: ChatMessage = {
  role: 'assistant',
  content: "**Marhaba!** I'm your guide for Morocco. Ask me about getting around, fair prices, food, customs or what to see.",
};

/**
 * Android: how much of this view the keyboard covers, as bottom padding.
 * Phones that draw edge to edge don't shrink the screen for the keyboard, so the
 * chat box would hide behind it; phones that do shrink it get 0 here.
 */
function useKeyboardPadding(ref: RefObject<ComponentRef<typeof View> | null>, onShow: () => void) {
  const [padding, setPadding] = useState(0);
  const keyboardTop = useRef<number | null>(null);

  const measure = useCallback(() => {
    const top = keyboardTop.current;
    if (top === null || !ref.current) {
      setPadding(0);
      return;
    }
    ref.current.measureInWindow((_x, y, _w, h) => setPadding(Math.max(0, Math.round(y + h - top))));
  }, [ref]);

  useEffect(() => {
    if (Platform.OS !== 'android') return;
    const show = Keyboard.addListener('keyboardDidShow', (e) => {
      keyboardTop.current = e.endCoordinates.screenY;
      measure();
      onShow();
    });
    const hide = Keyboard.addListener('keyboardDidHide', () => {
      keyboardTop.current = null;
      setPadding(0);
    });
    return () => {
      show.remove();
      hide.remove();
    };
  }, [measure, onShow]);

  return { padding, onLayout: measure };
}

export default function AskScreen() {
  const c = useThemeColors();
  const scrollRef = useRef<ComponentRef<typeof ScrollView>>(null);
  const rootRef = useRef<ComponentRef<typeof View>>(null);
  const scrollToEnd = useCallback(() => {
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 50);
  }, []);
  const keyboard = useKeyboardPadding(rootRef, scrollToEnd);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function send(text: string) {
    const question = text.trim();
    if (!question || busy) return;

    const history: ChatMessage[] = [...messages, { role: 'user', content: question }];
    setMessages(history);
    setInput('');
    setError(null);
    setBusy(true);
    try {
      const reply = await askMarhaba(history);
      setMessages([...history, { role: 'assistant', content: reply }]);
    } catch (e) {
      // Put the question back so the traveller can resend it.
      setMessages(messages);
      setInput(question);
      setError(e instanceof ChatError ? e.message : 'Something went wrong. Try again in a moment.');
    } finally {
      setBusy(false);
    }
  }

  const content = (
    <>
      <ScrollView
        ref={scrollRef}
        style={styles.flex}
        contentContainerStyle={styles.chat}
        // Follow new messages, but keep the guide in view before the first question.
        onContentSizeChange={() => {
          if (messages.length > 0 || busy) scrollRef.current?.scrollToEnd({ animated: true });
        }}
        keyboardShouldPersistTaps="handled">
        {messages.length === 0 && !busy ? <GuideHero /> : null}
        <Bubble message={WELCOME} animate={false} />
        {messages.map((m, i) => (
          <Bubble key={i} message={m} />
        ))}
        {busy ? <Bubble thinking /> : null}
        {error ? <Text style={[styles.error, { color: c.danger }]}>{error}</Text> : null}
        {messages.length === 0 && !busy ? (
          <View style={styles.suggestions}>
            <SectionLabel>Try asking</SectionLabel>
            <View style={styles.chips}>
              {SUGGESTIONS.map((s, i) => (
                <GlideIn key={s} index={i}>
                  <Chip label={s} onPress={() => send(s)} />
                </GlideIn>
              ))}
            </View>
          </View>
        ) : null}
      </ScrollView>

      <GuideBar />
      <View style={[styles.composer, { backgroundColor: c.surface }]}>
        <TextInput
          value={input}
          onChangeText={setInput}
          onSubmitEditing={() => send(input)}
          editable={!busy}
          placeholder="Ask anything about Morocco"
          placeholderTextColor={c.muted}
          returnKeyType="send"
          accessibilityLabel="Your question"
          style={[styles.input, { color: c.text, borderColor: c.line, backgroundColor: c.background }]}
        />
        <PressableScale
          accessibilityRole="button"
          accessibilityLabel="Send"
          disabled={busy || !input.trim()}
          onPress={() => send(input)}
          style={[styles.send, { backgroundColor: c.primary, opacity: busy || !input.trim() ? 0.5 : 1 }]}>
          <Text style={[styles.sendText, { color: c.onPrimary }]}>Send</Text>
        </PressableScale>
      </View>
    </>
  );

  if (Platform.OS === 'ios') {
    return (
      <KeyboardAvoidingView style={styles.flex} behavior="padding" keyboardVerticalOffset={90}>
        {content}
      </KeyboardAvoidingView>
    );
  }
  // Android (and web): the bottom padding keeps the question box just above the keyboard.
  return (
    <View ref={rootRef} onLayout={keyboard.onLayout} style={[styles.flex, { paddingBottom: keyboard.padding }]}>
      {content}
    </View>
  );
}

function Bubble({
  message,
  thinking = false,
  animate = true,
}: {
  message?: ChatMessage;
  thinking?: boolean;
  animate?: boolean;
}) {
  const c = useThemeColors();
  const isUser = message?.role === 'user';
  const color = isUser ? '#FFFFFF' : c.text;
  // Your messages slide in from the right, Marhaba's from the left.
  const entering = animate ? (isUser ? SlideInRight : SlideInLeft).springify().damping(18).stiffness(180) : undefined;

  return (
    <Animated.View entering={entering} style={isUser ? styles.rowUser : styles.rowBot}>
      {isUser ? null : <GuideAvatar size={30} />}
      <View
        style={[
          styles.bubble,
          isUser
            ? [styles.bubbleUser, { backgroundColor: c.bubbleUser }]
            : [styles.bubbleBot, { backgroundColor: c.surface, borderColor: c.line }],
        ]}>
        {thinking || !message ? (
          <TypingDots color={c.muted} />
        ) : (
          <Text selectable style={[styles.bubbleText, { color }]}>
            {formatReply(message.content).map((s, i) => (
              <Text key={i} style={s.bold ? styles.bold : undefined}>
                {s.text}
              </Text>
            ))}
          </Text>
        )}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  chat: { padding: 16, gap: 10 },
  rowUser: { flexDirection: 'row', justifyContent: 'flex-end' },
  rowBot: { flexDirection: 'row', alignItems: 'flex-end', gap: 8 },
  bubble: { maxWidth: '85%', flexShrink: 1, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 16 },
  bubbleUser: { borderBottomRightRadius: 4 },
  bubbleBot: { borderBottomLeftRadius: 4, borderWidth: 1 },
  bubbleText: { fontFamily: fonts.body, fontSize: 15, lineHeight: 21 },
  bold: { fontFamily: fonts.bold },
  error: { fontFamily: fonts.medium, fontSize: 14 },
  suggestions: { gap: 8, marginTop: 8 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  composer: { flexDirection: 'row', gap: 8, paddingTop: 2, paddingBottom: 10, paddingHorizontal: 16 },
  input: {
    flex: 1,
    minWidth: 0,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontFamily: fonts.body,
    fontSize: 15,
  },
  send: { borderRadius: 999, paddingHorizontal: 16, justifyContent: 'center' },
  sendText: { fontFamily: fonts.semibold, fontSize: 15 },
});
