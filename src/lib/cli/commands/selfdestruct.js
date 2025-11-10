// @ts-nocheck
export async function run(input, ctx) {
  const termWin = document.querySelector('.terminal-window');
  const overlay = document.createElement('div');
  Object.assign(overlay.style, { position:'fixed', inset:'0', background:'rgba(255,0,0,0.04)', zIndex:'1001', pointerEvents:'none' });
  document.body.appendChild(overlay);
  let elapsed = 0;
  const interval = setInterval(()=>{ overlay.style.background = `rgba(255,0,0,${0.04 + Math.random()*0.1})`; }, 80);
  const t = performance.now();
  function shaker(){
    const n = Math.sin(performance.now()/40)*1.5;
    termWin.style.transform = `translate(${n}px, ${-n}px)`;
    if (performance.now()-t < 5000) requestAnimationFrame(shaker);
    else termWin.style.transform = '';
  }
  shaker();
  const nodes = Array.from(ctx.body.querySelectorAll('.line'));
  const step = async () => {
    for (let i=nodes.length-1;i>=0;i--){ nodes[i].remove(); await wait(50); }
  };
  await step();
  await wait(5000);
  clearInterval(interval); overlay.remove();
  await ctx.typeLines(['[fatal] system meltdown detected','reboot required'], 24);
  const mod = await import('./reboot');
  await mod.run('', ctx);
  try { const a = await import('../../achievements'); a.unlockAchievement('meltdown'); } catch(_){ }
}
function wait(ms){ return new Promise(r=>setTimeout(r,ms)); }
