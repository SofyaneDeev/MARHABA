// Marhaba "ask" function: receives the chat from the app, asks an AI model, returns the reply.
// The API key is a Supabase secret and never reaches the app:
//   GEMINI_API_KEY    → Google Gemini (free tier available at aistudio.google.com)
//   ANTHROPIC_API_KEY → Claude (used when no Gemini key is set)
import Anthropic from "npm:@anthropic-ai/sdk";

const geminiKey = Deno.env.get("GEMINI_API_KEY")?.trim();
const anthropicKey = Deno.env.get("ANTHROPIC_API_KEY")?.trim();
const claude = !geminiKey && anthropicKey ? new Anthropic({ apiKey: anthropicKey }) : null;

// Tried in order. "Lite" is faster and less often overloaded on the free tier.
const GEMINI_MODELS = [
  { model: "gemini-flash-latest", timeoutMs: 35_000 },
  { model: "gemini-flash-lite-latest", timeoutMs: 40_000 },
];
const CLAUDE_MODEL = "claude-opus-5-5";
const MAX_TURNS = 12;
const MAX_CHARS_PER_TURN = 2000;
const MAX_OUTPUT_TOKENS = 4000;

const SYSTEM = `You are Marhaba, a friendly, practical travel companion for tourists visiting Morocco.
- Answer in the same language the traveller writes in.
- Be concise and mobile-friendly: short paragraphs or up to 6 bullets. No headings, no tables.
- Give concrete, local advice: prices in MAD (with a rough euro equivalent), transport options (ONCF trains, CTM/Supratours buses, petit/grand taxis), useful Darija phrases written phonetically, etiquette, and safety.
- For price questions, give a fair typical range, say it varies by quality, season and city, and add one haggling tip.
- Never invent opening hours, phone numbers or exact schedules; say "check locally" when unsure.
- For emergencies, tell them to call 19 (police), 15 (ambulance/fire) or 112 from a mobile.`;

const headers = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type",
};

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers });
}

type Turn = { role: "user" | "assistant"; content: string };

/** An error to send back to the app with this status. */
class ReplyError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

// Accept only a short, well-formed conversation that starts and ends on a user turn.
function cleanTurns(input: unknown): Turn[] | null {
  if (!Array.isArray(input)) return null;
  const turns: Turn[] = [];
  for (const t of input.slice(-MAX_TURNS)) {
    if (!t || (t.role !== "user" && t.role !== "assistant")) return null;
    if (typeof t.content !== "string" || !t.content.trim()) return null;
    turns.push({ role: t.role, content: t.content.slice(0, MAX_CHARS_PER_TURN) });
  }
  while (turns.length && turns[0].role !== "user") turns.shift();
  if (!turns.length || turns[turns.length - 1].role !== "user") return null;
  return turns;
}

async function askGemini(key: string, messages: Turn[]): Promise<string> {
  const body = JSON.stringify({
    systemInstruction: { parts: [{ text: SYSTEM }] },
    contents: messages.map((m) => ({ role: m.role === "assistant" ? "model" : "user", parts: [{ text: m.content }] })),
    generationConfig: { maxOutputTokens: MAX_OUTPUT_TOKENS },
  });

  // Free-tier models are often overloaded or slow, so each one gets a time limit and the
  // next is tried when it fails. Together they stay under the app's 90-second limit.
  let busy = false;
  for (const { model, timeoutMs } of GEMINI_MODELS) {
    let status: number;
    try {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-goog-api-key": key },
        body,
        signal: AbortSignal.timeout(timeoutMs),
      });
      if (res.ok) return geminiText(await res.json());
      status = res.status;
      console.error(`Gemini ${model} error`, status, await res.text());
    } catch (err) {
      console.error(`Gemini ${model} gave no answer in time`, err);
      continue;
    }
    if (status === 400 || status === 403) break; // a bad request or key: other models won't help
    if (status === 429) busy = true;
  }
  throw busy ? new ReplyError(429, "Busy, try again soon.") : new ReplyError(502, "The assistant is unavailable.");
}

// deno-lint-ignore no-explicit-any
function geminiText(data: any): string {
  const candidate = data.candidates?.[0];
  if (!candidate && data.promptFeedback?.blockReason) return "I can't help with that one. Try asking another way.";
  return (candidate?.content?.parts ?? [])
    .flatMap((p: { text?: string; thought?: boolean }) => (p.text && !p.thought ? [p.text] : []))
    .join("")
    .trim();
}

async function askClaude(client: Anthropic, messages: Turn[]): Promise<string> {
  try {
    const response = await client.beta.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: MAX_OUTPUT_TOKENS,
      system: SYSTEM,
      output_config: { effort: "low" }, // chat answers don't need deep thinking
      // If Claude declines a message, the API retries it on a suitable fallback model.
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      messages,
    });
    if (response.stop_reason === "refusal") return "I can't help with that one. Try asking another way.";
    return response.content
      .flatMap((block) => (block.type === "text" ? [block.text] : []))
      .join("\n")
      .trim();
  } catch (err) {
    if (err instanceof Anthropic.RateLimitError) throw new ReplyError(429, "Busy, try again soon.");
    if (err instanceof Anthropic.APIError) {
      console.error("Claude API error", err.status, err.message);
      throw new ReplyError(502, "The assistant is unavailable.");
    }
    throw err;
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers });
  if (req.method !== "POST") return json({ error: "Use POST." }, 405);
  if (!geminiKey && !claude) {
    console.error("No AI key is set. Add GEMINI_API_KEY (or ANTHROPIC_API_KEY) under Edge Functions > Secrets.");
    return json({ error: "The assistant is not configured." }, 503);
  }

  let body: { messages?: unknown };
  try {
    body = await req.json();
  } catch {
    return json({ error: "Body must be JSON." }, 400);
  }
  const messages = cleanTurns(body.messages);
  if (!messages) return json({ error: "Send a conversation that ends with a user message." }, 400);

  try {
    const reply = geminiKey ? await askGemini(geminiKey, messages) : await askClaude(claude!, messages);
    if (!reply) return json({ error: "Empty reply." }, 502);
    return json({ reply });
  } catch (err) {
    if (err instanceof ReplyError) return json({ error: err.message }, err.status);
    console.error(err);
    return json({ error: "Server error." }, 500);
  }
});
