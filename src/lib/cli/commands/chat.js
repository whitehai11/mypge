import { sendNeonChat } from '../../ai';

let chatMode = false;
let conversation = [];

async function replyWithAI(ctx, message) {
  const history = [
    { role: 'system', content: 'You are maro.ai, a neon terminal assistant. Answer concisely with helpful tone.' },
    ...conversation,
    { role: 'user', content: message }
  ];
  const result = await sendNeonChat(history);
  conversation.push({ role: 'user', content: message });
  conversation.push({ role: 'assistant', content: result });
  await ctx.typeLines([`maro.ai: ${result}`], 22);
}

export async function run(input, ctx) {
  if (chatMode) return;
  chatMode = true;
  conversation = [];
  await ctx.typeLines(['[chat] Connected to maro.ai (type: exit chat)'], 28);
  try { const a = await import('../../achievements'); a.unlockAchievement('chat_used'); } catch(_){ }
  ctx.bindMode({
    name: 'chat',
    onInput: async (line) => {
      const text = line.trim();
      if (!text) return;
      if (text.toLowerCase() === 'exit chat') {
        chatMode = false;
        conversation = [];
        ctx.unbindMode();
        await ctx.typeLines(['[chat] closed'], 28);
        return;
      }
      await ctx.typeLines([`you: ${text}`], 24);
      try {
        await replyWithAI(ctx, text);
      } catch (error) {
        await ctx.typeLines([`[chat error] ${error?.message || error}`], 24);
      }
    },
  });
}

if (typeof window !== 'undefined') {
  window.addEventListener('terminal:interrupt', () => {
    chatMode = false;
    conversation = [];
  });
}
