let player;

export async function run(input, ctx) {
  // Accept: "play lo-fi" or "play lofi"
  const cmd = input.trim().toLowerCase();
  if (cmd === 'pause') return pause(ctx);
  if (cmd === 'resume') return resume(ctx);

  const tracks = [
    'Vibin-chosic.com_.mp3', // existing file in root as fallback
    // You can add more under /assets/audio/ and list here
  ];
  const src = tracks[(Math.random()*tracks.length)|0];

  if (!player) {
    player = new Audio();
    player.loop = true;
    player.preload = 'metadata';
    player.volume = 0.6;
  }
  player.src = src;
  try { await player.play(); } catch (_) {}
  await ctx.typeLines([`[audio] now playing: "${src}"`], 28);
}

async function pause(ctx){ if (player && !player.paused){ player.pause(); await ctx.typeLines(['[audio] ⏸ paused'], 28);} }
async function resume(ctx){ if (player && player.paused){ try{ await player.play(); }catch(_){ } await ctx.typeLines(['[audio] ▶ resumed'], 28);} }

