// @ts-nocheck
export async function run(input, ctx) {
  const termWin = document.querySelector('.terminal-window');
  termWin?.classList.add('tw-glitch');
  setTimeout(()=> termWin?.classList.remove('tw-glitch'), 3000);
  await ctx.typeLines(['[system] initializing timewarp...'], 24);
  await wait(1000);
  const future = new Date(); future.setFullYear(future.getFullYear()+50);
  await ctx.typeLines([`[system] welcome back... it's ${future.toISOString().slice(0,10)}`], 24);
  await ctx.typeLines([`[system] welcome back... it’s the future now.`], 24);
}

function wait(ms){ return new Promise(r=>setTimeout(r,ms)); }
