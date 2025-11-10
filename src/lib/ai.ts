/// <reference types="vite/client" />

const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
};

const API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const env = (import.meta && 'env' in import.meta ? (import.meta).env : {}) as Record<string, string | undefined>;
const API_KEY = env.VITE_OPENROUTER_API_KEY;
const REFERER = env.VITE_SITE_URL || 'https://maro.run';
const TITLE = env.VITE_SITE_TITLE || 'Maro CLI';

export type ChatMessage = { role: 'system' | 'user' | 'assistant'; content: string };

export async function sendNeonChat(messages: ChatMessage[]) {
  if (!API_KEY) {
    throw new Error('Missing OpenRouter API key. Set VITE_OPENROUTER_API_KEY.');
  }
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      ...DEFAULT_HEADERS,
      Authorization: `Bearer ${API_KEY}`,
      'HTTP-Referer': REFERER,
      'X-Title': TITLE,
    },
    body: JSON.stringify({
      model: 'meta-llama/llama-3.3-8b-instruct:free',
      messages,
      max_tokens: 256,
      temperature: 0.6,
    }),
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`OpenRouter error ${response.status}: ${text}`);
  }
  const payload = await response.json();
  const choice = payload?.choices?.[0]?.message?.content;
  if (!choice) throw new Error('Empty AI response');
  return Array.isArray(choice)
    ? choice.map((block: { text?: string }) => block?.text || '').join('\n').trim()
    : String(choice).trim();
}
