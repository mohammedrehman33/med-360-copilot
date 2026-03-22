import { config } from 'dotenv';

config({ override: true });

// ---------------------------------------------------------------------------
// Provider detection
// ---------------------------------------------------------------------------

type Provider = 'anthropic' | 'openai' | 'gemini';

interface ProviderInfo {
  provider: Provider;
  apiKey: string;
}

let cachedProvider: ProviderInfo | null = null;

function detectProvider(): ProviderInfo {
  if (cachedProvider) return cachedProvider;

  config({ override: true });

  if (process.env.ANTHROPIC_API_KEY) {
    cachedProvider = { provider: 'anthropic', apiKey: process.env.ANTHROPIC_API_KEY };
  } else if (process.env.OPENAI_API_KEY) {
    cachedProvider = { provider: 'openai', apiKey: process.env.OPENAI_API_KEY };
  } else if (process.env.GOOGLE_API_KEY) {
    cachedProvider = { provider: 'gemini', apiKey: process.env.GOOGLE_API_KEY };
  } else {
    throw new Error(
      'No AI provider API key found. Set one of the following environment variables:\n' +
      '  - ANTHROPIC_API_KEY  (Claude / Anthropic)\n' +
      '  - OPENAI_API_KEY     (OpenAI / GPT)\n' +
      '  - GOOGLE_API_KEY     (Google Gemini)\n'
    );
  }

  return cachedProvider;
}

// ---------------------------------------------------------------------------
// Default models per provider
// ---------------------------------------------------------------------------

function defaultModel(provider: Provider): string {
  switch (provider) {
    case 'anthropic': return 'claude-sonnet-4-6';
    case 'openai':    return 'gpt-4o-mini';
    case 'gemini':    return 'gemini-2.0-flash';
  }
}

// ---------------------------------------------------------------------------
// AGENT_MODEL – set based on detected provider (or env override)
// ---------------------------------------------------------------------------

export const AGENT_MODEL: string = (() => {
  if (process.env.CLAUDE_MODEL) return process.env.CLAUDE_MODEL;
  try {
    const { provider } = detectProvider();
    return defaultModel(provider);
  } catch {
    // No key set yet – fall back; callClaude will throw a clear error later.
    return 'claude-sonnet-4-6';
  }
})();

// ---------------------------------------------------------------------------
// getClient()
// Returns an Anthropic SDK client when ANTHROPIC_API_KEY is set.
// NOTE: Direct client usage (e.g. client.messages.create) only works with
// the Anthropic provider. For provider-agnostic calls use callClaude().
// ---------------------------------------------------------------------------

let anthropicClient: any = null;

export function getClient(): any {
  if (!anthropicClient) {
    config({ override: true });
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error(
        'getClient() requires ANTHROPIC_API_KEY because it returns an Anthropic SDK client. ' +
        'For provider-agnostic usage, call callClaude() instead.'
      );
    }
    // Dynamic import at runtime is awkward in sync code, so we use require.
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const Anthropic = require('@anthropic-ai/sdk').default;
    console.log(`[AI Provider] Initializing Anthropic client with key: ${apiKey.slice(0, 12)}...${apiKey.slice(-4)}`);
    anthropicClient = new Anthropic({ apiKey });
  }
  return anthropicClient;
}

// ---------------------------------------------------------------------------
// Provider-specific call implementations
// ---------------------------------------------------------------------------

interface CallOpts {
  system: string;
  prompt: string;
  model?: string;
  maxTokens?: number;
  images?: Array<{ data: string; mediaType: string }>;
}

async function callAnthropic(opts: CallOpts, apiKey: string, model: string): Promise<string> {
  const Anthropic = require('@anthropic-ai/sdk').default;
  const client = new Anthropic({ apiKey });

  const content: any[] = [];

  if (opts.images?.length) {
    for (const img of opts.images) {
      content.push({
        type: 'image',
        source: {
          type: 'base64',
          media_type: img.mediaType,
          data: img.data,
        },
      });
    }
  }

  content.push({ type: 'text', text: opts.prompt });

  const message = await client.messages.create({
    model,
    max_tokens: opts.maxTokens || 4096,
    system: opts.system,
    messages: [{ role: 'user', content }],
  });

  console.log(`[AI Provider] Anthropic response: stop_reason=${message.stop_reason}`);

  const textBlocks = message.content.filter((block: any) => block.type === 'text');

  if (textBlocks.length === 0) {
    throw new Error(`Anthropic returned no text content. Stop reason: ${message.stop_reason}`);
  }

  return textBlocks.map((b: any) => b.text).join('\n');
}

async function callOpenAI(opts: CallOpts, apiKey: string, model: string): Promise<string> {
  const OpenAI = require('openai').default;
  const client = new OpenAI({ apiKey });

  // Build user message content
  let userContent: any;

  if (opts.images?.length) {
    const parts: any[] = [];
    for (const img of opts.images) {
      parts.push({
        type: 'image_url',
        image_url: { url: `data:${img.mediaType};base64,${img.data}` },
      });
    }
    parts.push({ type: 'text', text: opts.prompt });
    userContent = parts;
  } else {
    userContent = opts.prompt;
  }

  const response = await client.chat.completions.create({
    model,
    max_tokens: opts.maxTokens || 4096,
    messages: [
      { role: 'system', content: opts.system },
      { role: 'user', content: userContent },
    ],
  });

  const text = response.choices?.[0]?.message?.content;
  if (!text) {
    throw new Error(`OpenAI returned no text content. Finish reason: ${response.choices?.[0]?.finish_reason}`);
  }

  console.log(`[AI Provider] OpenAI response: finish_reason=${response.choices[0].finish_reason}`);
  return text;
}

async function callGemini(opts: CallOpts, apiKey: string, model: string): Promise<string> {
  const { GoogleGenAI } = require('@google/genai');
  const ai = new GoogleGenAI({ apiKey });

  // Build contents parts
  const parts: any[] = [];

  if (opts.images?.length) {
    for (const img of opts.images) {
      parts.push({
        inlineData: { mimeType: img.mediaType, data: img.data },
      });
    }
  }

  parts.push({ text: opts.prompt });

  const response = await ai.models.generateContent({
    model,
    contents: [{ role: 'user', parts }],
    config: {
      systemInstruction: opts.system,
      maxOutputTokens: opts.maxTokens || 4096,
    },
  });

  const text = response.text;
  if (!text) {
    throw new Error('Google Gemini returned no text content.');
  }

  console.log(`[AI Provider] Gemini response received`);
  return text;
}

// ---------------------------------------------------------------------------
// callClaude – provider-agnostic entry point
// ---------------------------------------------------------------------------

export async function callClaude(opts: {
  system: string;
  prompt: string;
  model?: string;
  maxTokens?: number;
  images?: Array<{ data: string; mediaType: string }>;
}): Promise<string> {
  const { provider, apiKey } = detectProvider();
  const model = opts.model || AGENT_MODEL;

  console.log(`[AI Provider] Using ${provider} with model=${model}`);

  switch (provider) {
    case 'anthropic':
      return callAnthropic(opts, apiKey, model);
    case 'openai':
      return callOpenAI(opts, apiKey, model);
    case 'gemini':
      return callGemini(opts, apiKey, model);
  }
}

// ---------------------------------------------------------------------------
// callClaudeJSON – wraps callClaude with JSON parsing
// ---------------------------------------------------------------------------

export async function callClaudeJSON<T>(opts: {
  system: string;
  prompt: string;
  model?: string;
  maxTokens?: number;
  images?: Array<{ data: string; mediaType: string }>;
}): Promise<T> {
  const text = await callClaude({
    ...opts,
    system: opts.system + '\n\nIMPORTANT: Return your response as valid JSON only. No markdown code fences, no extra text.',
  });

  let jsonStr = text.trim();
  if (jsonStr.startsWith('```')) {
    jsonStr = jsonStr.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
  }

  if (!jsonStr.startsWith('[') && !jsonStr.startsWith('{')) {
    const jsonMatch = jsonStr.match(/(\[[\s\S]*\]|\{[\s\S]*\})/);
    if (jsonMatch) {
      jsonStr = jsonMatch[1];
    }
  }

  try {
    return JSON.parse(jsonStr) as T;
  } catch (parseError) {
    console.error('[AI Provider] JSON parse failed. Raw text:', jsonStr.slice(0, 500));
    throw new Error(`Failed to parse AI response as JSON: ${parseError}`);
  }
}
