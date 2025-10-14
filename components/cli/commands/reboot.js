export async function run(input, ctx) {
  ctx.body.innerHTML = '';
  const logo = [
    '   __  __             ____             ',
    '  |  \/  | ___  _ __ |  _ \ _   _ _ __ ',
    '  | |\/| |/ _ \| \'_ \| |_) | | | | \'_ \',
    '  | |  | | (_) | | | |  _ <| |_| | | | |',
    '  |_|  |_|\___/|_| |_|_| \_\\__,_|_| |_|',
  ];
  await ctx.typeLines(logo, 10);
  const lines = [
    'Loading Gothlab Core v2.3',
    'Initializing neural subsystems...',
    'Verifying boot integrity...',
  ];
  for (const l of lines){ await ctx.typeLines([l], 28); await wait(600);} 
  await wait(1200);
  await ctx.typeLines(['System online.'], 24);
}
function wait(ms){ return new Promise(r=>setTimeout(r,ms)); }

