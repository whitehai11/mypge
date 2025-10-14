let chatMode = false;
const responses = [
  'maro.sys: analyzing...',
  'maro.sys: insufficient data',
  'maro.sys: try a different angle',
  'maro.sys: that’s oddly specific',
  'maro.sys: acknowledged',
];

export async function run(input, ctx) {
  if (chatMode) return;
  chatMode = true;
  await ctx.typeLines(['[chat] enter your message (type: exit chat)'], 28);
  ctx.bindMode({
    name: 'chat',
    onInput: async (line) => {
      const l = line.trim();
      if (!l) return;
      if (l.toLowerCase() === 'exit chat') { chatMode=false; ctx.unbindMode(); await ctx.typeLines(['[chat] closed'], 28); return; }
      await ctx.typeLines([`you: ${l}`], 24);
      const ans = responses[(Math.random()*responses.length)|0];
      await ctx.typeLines([ans], 24);
    },
  });
}

