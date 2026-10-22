// Marhaba "ask" function: receives the chat from the app, asks Claude, returns the reply.
// The Claude API key is a Supabase secret (ANTHROPIC_API_KEY) and never reaches the app.
import Anthropic from "npm:@anthropic-ai/sdk";

const apiKey = Deno.env.get("ANTHROPIC_API_KEY")?.trim();
const client = apiKey ? new Anthropic({ apiKey }) : null;

const MODEL = "claude-opus-5-5";
const MAX_TURNS = 12;
const MAX_CHARS_PER_TURN = 2000;

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

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers });
  if (req.method !== "POST") return json({ error: "Use POST." }, 405);
  if (!client) {
    console.error("ANTHROPIC_API_KEY is not set. Add it under Edge Functions > Secrets.");
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
    const response = await client.beta.messages.create({
      model: MODEL,
      max_tokens: 4000,
      system: SYSTEM,
      output_config: { effort: "low" }, // chat answers don't need deep thinking
      // If Claude declines a message, the API retries it on a suitable fallback model.
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      messages,
    });

    if (response.stop_reason === "refusal") {
      return json({ reply: "I can't help with that one. Try asking another way." });
    }
    const reply = response.content
      .flatMap((block) => (block.type === "text" ? [block.text] : []))
      .join("\n")
      .trim();
    if (!reply) return json({ error: "Empty reply." }, 502);
    return json({ reply });
  } catch (err) {
    if (err instanceof Anthropic.RateLimitError) return json({ error: "Busy, try again soon." }, 429);
    if (err instanceof Anthropic.APIError) {
      console.error("Claude API error", err.status, err.message);
      return json({ error: "The assistant is unavailable." }, 502);
    }
    console.error(err);
    return json({ error: "Server error." }, 500);
  }
});
