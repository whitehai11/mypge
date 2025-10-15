// ASCII TV: render short video as ASCII for ~10s
export async function run(input, ctx) {
  const srcs = [
    '4216715-uhd_3840_2160_25fps.mp4',
  ];
  const src = srcs[0];
  const video = document.createElement('video');
  video.src = src; video.muted = true; video.playsInline = true; video.preload = 'metadata';
  try { await video.play(); } catch(_){ /* mobile may block; try load then play on click */ }

  const pre = document.createElement('pre');
  pre.style.whiteSpace = 'pre';
  pre.style.font = '10px/8px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace';
  pre.style.color = '#aee7df';
  ctx.body.appendChild(pre);

  const canvas = document.createElement('canvas');
  const cctx = canvas.getContext('2d');
  const chars = ' .:-=+*#%@';
  let running = true;

  const t0 = performance.now();
  let onInterrupt;
  function step(){
    if (!running) return;
    const W = 120, H = 60;
    canvas.width=W; canvas.height=H;
    try { cctx.drawImage(video, 0,0,W,H); } catch(_) {}
    const data = cctx.getImageData(0,0,W,H).data;
    let out='';
    for (let y=0;y<H;y++){
      for (let x=0;x<W;x++){
        const i = (y*W+x)*4; const r=data[i], g=data[i+1], b=data[i+2];
        const lum = (0.299*r+0.587*g+0.114*b)/255;
        const idx = Math.max(0, Math.min(chars.length-1, Math.floor(lum*(chars.length-1))));
        out += chars[idx];
      }
      out += '\n';
    }
    pre.textContent = out;
    if (performance.now() - t0 < 10_000) {
      setTimeout(step, 50); // ~20fps
    } else {
      running = false; video.pause(); pre.insertAdjacentText('beforebegin', '[tv] ');
      pre.insertAdjacentText('afterend', '\n[tv] broadcast finished');
      if (onInterrupt) window.removeEventListener('terminal:interrupt', onInterrupt);
    }
  }
  step();
  // Allow Ctrl+C interrupt
  onInterrupt = ()=>{ running=false; try{ video.pause(); }catch(_){ } try{ pre.remove(); }catch(_){ } };
  window.addEventListener('terminal:interrupt', onInterrupt);
  try { const a = await import('../../achievements.js'); a.unlockAchievement('tv_watched'); } catch(_){ }
}
