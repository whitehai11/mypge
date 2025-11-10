// @ts-nocheck
let player;
let ui;

export async function run(input, ctx) {
  const cmd = input.trim().toLowerCase();
  if (cmd === 'pause') return pause(ctx);
  if (cmd === 'resume') return resume(ctx);

  const tracks = [
    '/assets/audio/lofi1.mp3',
    'Vibin-chosic.com_.mp3',
  ];
  const src = tracks[(Math.random()*tracks.length)|0];

  ensurePlayer();
  player.src = src;
  try { await player.play(); } catch (_) {}
  await ctx.typeLines([`[audio] now playing: "${src}"`], 28);
  ensureUI();
  updateUI();
}

async function pause(ctx){ if (player && !player.paused){ player.pause(); await ctx.typeLines(['[audio] ⏸ paused'], 28);} }
async function resume(ctx){ if (player && player.paused){ try{ await player.play(); }catch(_){ } await ctx.typeLines(['[audio] ▶ resumed'], 28);} }

function ensurePlayer(){
  if (player) return player;
  player = new Audio();
  player.loop = true;
  player.preload = 'metadata';
  player.volume = 0.6;
  try {
    window.addEventListener('terminal:interrupt', () => { player?.pause(); updateUI(); });
  } catch(_){ }
  return player;
}

function ensureUI(){
  if (ui && document.body.contains(ui.host)) return;
  const host = document.createElement('div');
  host.className = 'music-player';
  host.innerHTML = `
    <button class="mp-btn mp-toggle" aria-label="Play/Pause">▶</button>
    <div class="mp-track">
      <div class="mp-title">Lo‑Fi</div>
      <input class="mp-vol" type="range" min="0" max="1" step="0.01" value="0.6" aria-label="Volume" />
    </div>
    <button class="mp-btn mp-close" aria-label="Close">✕</button>
  `;
  document.body.appendChild(host);
  const toggle = host.querySelector('.mp-toggle');
  const vol = host.querySelector('.mp-vol');
  const close = host.querySelector('.mp-close');
  toggle.addEventListener('click', ()=>{ ensurePlayer(); if (player.paused) player.play().then(updateUI).catch(()=>{}); else { player.pause(); updateUI(); } });
  vol.addEventListener('input', ()=>{ ensurePlayer(); player.volume = Number(vol.value); });
  close.addEventListener('click', ()=>{ try{ player.pause(); }catch(_){ } host.remove(); });
  ui = { host, toggle, vol };
}

function updateUI(){
  if (!ui) return;
  if (player && !player.paused) ui.toggle.textContent = '⏸'; else ui.toggle.textContent = '▶';
  if (player) ui.vol.value = String(player.volume);
}

export function stop(){ try{ player?.pause(); }catch(_){ } }
