// @ts-nocheck
let raf, canvas, ctx, cols, drops, running=false;

export async function run(input, ctx) {
  if (running) return;
  running = true;
  canvas = document.createElement('canvas');
  canvas.style.position = 'fixed';
  canvas.style.inset = '0';
  canvas.style.zIndex = '1003';
  canvas.style.pointerEvents = 'none';
  document.body.appendChild(canvas);
  ctx = canvas.getContext('2d');

  function resize(){ canvas.width=window.innerWidth; canvas.height=window.innerHeight; const fontSize=14; cols = Math.floor(canvas.width / fontSize); drops = Array(cols).fill(1); ctx.font = `${fontSize}px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace`; }
  resize();
  window.addEventListener('resize', resize);

  function step(){
    ctx.fillStyle = 'rgba(0,0,0,0.05)';
    ctx.fillRect(0,0,canvas.width,canvas.height);
    ctx.fillStyle = '#00ff88';
    for (let i=0;i<drops.length;i++) {
      const text = String.fromCharCode(0x30A0 + Math.floor(Math.random()*96));
      ctx.fillText(text, i*14, drops[i]*14);
      if (drops[i]*14 > canvas.height && Math.random() > 0.975) drops[i] = 0;
      drops[i]++;
    }
    raf = requestAnimationFrame(step);
  }
  step();

  function stop(){
    if (!running) return;
    cancelAnimationFrame(raf);
    running=false;
    canvas.remove();
    window.removeEventListener('resize', resize);
    window.removeEventListener('keydown', onKey);
  }
  function onKey(e){ if (e.key === 'Escape') stop(); }
  window.addEventListener('keydown', onKey);

  ctxState.matrix = { stop };
  await ctx.typeLines(['[matrix] press Esc to exit'], 28);
  try { const a = await import('../../achievements'); a.unlockAchievement('matrix_mode'); } catch(_){ }
}

let ctxState = {};
export function bind(state){ ctxState = state; }
