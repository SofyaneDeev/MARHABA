import { hasBackend, SUPABASE_URL, supabaseHeaders } from '@/lib/supabase';

export type ChatMessage = { role: 'user' | 'assistant'; content: string };

/** An error whose message can be shown to the traveller as is. */
export class ChatError extends Error {}

// The Claude API key stays on the server (a Supabase secret) and is never in the app.
const MAX_TURNS = 12;
const GENERIC_ERROR = 'Something went wrong. Try again in a moment.';

/** Sends the recent conversation to the `ask` Supabase function and returns Claude's reply. */
export async function askMarhaba(history: ChatMessage[]): Promise<string> {
  if (!hasBackend()) {
    throw new ChatError('The AI assistant is not connected yet. Phrases, Medina and SOS work offline.');
  }

  // Send only the recent conversation, starting on a user turn.
  const recent = history.slice(-MAX_TURNS);
  const firstUser = recent.findIndex((m) => m.role === 'user');
  const messages = firstUser === -1 ? [] : recent.slice(firstUser);

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 90_000);
  let res: Response;
  try {
    res = await fetch(`${SUPABASE_URL}/functions/v1/ask`, {
      method: 'POST',
      headers: supabaseHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ messages }),
      signal: controller.signal,
    });
  } catch {
    throw new ChatError('No connection. Check your internet and try again.');
  } finally {
    clearTimeout(timer);
  }

  if (res.status === 429) throw new ChatError('Too many questions at once. Wait a minute and try again.');
  if (!res.ok) throw new ChatError(GENERIC_ERROR);

  let data: unknown;
  try {
    data = await res.json();
  } catch {
    throw new ChatError(GENERIC_ERROR);
  }
  const reply = (data as { reply?: unknown } | null)?.reply;
  if (typeof reply !== 'string' || !reply.trim()) throw new ChatError(GENERIC_ERROR);
  return reply.trim();
}
