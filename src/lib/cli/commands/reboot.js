// @ts-nocheck
export async function run(input, ctx) {
  try { window.dispatchEvent(new CustomEvent('terminal:interrupt')); } catch(_){ }
  ctx.body.innerHTML = '';
  const logo = String.raw`
   __  __             ____             
  |  \/  | ___  _ __ |  _ \ _   _ _ __ 
  | |\/| |/ _ \| '_ \| |_) | | | | '_ \
  | |  | | (_) | | | |  _ <| |_| | | | |
  |_|  |_|\___/|_| |_|_| \_\\__,_|_| |_|
  `.trim().split('\n');
  await ctx.typeLines(logo, 10);
  const lines = [
    'Loading Core v2.3',
    'Initializing neural subsystems...',
    'Verifying boot integrity...',
  ];
  for (const l of lines) {
    await ctx.typeLines([l], 28);
    await wait(600);
  }
  await wait(1200);
  await ctx.typeLines(['System online.'], 24);
  await ctx.typeLines(['Maro interactive shell - type `help` to begin'], 24);
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
