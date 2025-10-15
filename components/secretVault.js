let overlay, panel, nav, content, focusables = [], lastFocused = null;
let audioCtx = null;
let currentTheme = null;
let achievements = new Set(JSON.parse(localStorage.getItem('maro_achievements') || '[]'));

function el(tag, cls, txt) { const e = document.createElement(tag); if (cls) e.className = cls; if (txt!=null) e.textContent=txt; return e; }
function btn(txt, cls='btn') { return el('button', cls, txt); }

function trapFocus(e) {
  if (!overlay?.classList.contains('active')) return;
  const isTab = e.key === 'Tab';
  if (!isTab) return;
  if (focusables.length === 0) return;
  const first = focusables[0];
  const last = focusables[focusables.length - 1];
  if (e.shiftKey && document.activeElement === first) {
    e.preventDefault(); last.focus();
  } else if (!e.shiftKey && document.activeElement === last) {
    e.preventDefault(); first.focus();
  }
}

function unlock(name) {
  achievements.add(name);
  localStorage.setItem('maro_achievements', JSON.stringify(Array.from(achievements)));
}

function setTheme(name, persist) {
  if (currentTheme) document.documentElement.classList.remove('theme-'+currentTheme);
  currentTheme = name;
  if (name) document.documentElement.classList.add('theme-'+name);
  if (persist) localStorage.setItem('maro_theme', name||'');
}

function loadPersistedTheme() {
  const t = localStorage.getItem('maro_theme');
  if (t) setTheme(t, false);
}

function makeAsciiGallery() {
  const wrap = el('div');
  const arts = [
`   __  __            _         
  |  \/  | __ _ _ __| |__  ___ 
  | |\/| |/ _` | '__| '_ \/ __|
  | |  | | (_| | |  | | | \__ \
  |_|  |_|\__,_|_|  |_| |_|___/
`,
`             /\\                 
   __       /::\\    __          
  /\\_\    /::::\\  /\\_\  ____  
 / / /   /:/\:::\\ \:\/ / / __ \
/_/ /   /:/  \:::\\ \::/ /_/ /_/ /
\\_\\   \\_\   \:::/  \\_\\ \\____/ 
`,
`          
   \\   
    \\_//  Tron Grid
    \\
   \\  \\
`
  ];
  arts.forEach(a=>{ const pre=el('pre','ascii-block'); pre.textContent=a; wrap.appendChild(pre); });
  return wrap;
}

function makeSoundboard(cfg) {
  const wrap = el('div', 'grid cols-2');
  const sounds = [
    { id:'click', make: (ctx)=>{ const o=ctx.createOscillator(); const g=ctx.createGain(); o.type='square'; o.frequency.value=880; g.gain.value=.05; o.connect(g).connect(ctx.destination); o.start(); o.stop(ctx.currentTime+0.06); }},
    { id:'glitch', make: (ctx)=>{ const b=ctx.createBuffer(1, 0.06*ctx.sampleRate, ctx.sampleRate); const d=b.getChannelData(0); for(let i=0;i<d.length;i++) d[i]=(Math.random()*2-1)* (i%23<3?.8:.2); const s=ctx.createBufferSource(); s.buffer=b; s.connect(ctx.destination); s.start(); }},
    { id:'chime', make: (ctx)=>{ const o=ctx.createOscillator(); const g=ctx.createGain(); o.type='sine'; o.frequency.setValueAtTime(880,ctx.currentTime); o.frequency.exponentialRampToValueAtTime(440, ctx.currentTime+.4); g.gain.setValueAtTime(.05, ctx.currentTime); g.gain.exponentialRampToValueAtTime(.0001, ctx.currentTime+.45); o.connect(g).connect(ctx.destination); o.start(); o.stop(ctx.currentTime+.5); }},
    { id:'static', make: (ctx)=>{ const b=ctx.createBuffer(1, 0.2*ctx.sampleRate, ctx.sampleRate); const d=b.getChannelData(0); for(let i=0;i<d.length;i++) d[i]=Math.random()*2-1; const s=ctx.createBufferSource(); s.buffer=b; const g=ctx.createGain(); g.gain.value=.02; s.connect(g).connect(ctx.destination); s.start(); }},
  ];
  sounds.forEach(s=>{
    const b = btn(s.id);
    b.addEventListener('click', ()=>{
      if (!cfg.secret.ENABLE_SFX) return;
      audioCtx = audioCtx || new (window.AudioContext||window.webkitAudioContext)();
      s.make(audioCtx);
      unlock('Played sound: '+s.id);
    });
    wrap.appendChild(b);
  });
  return wrap;
}

function makeThemes(cfg) {
  const wrap = el('div');
  const row = el('div','row');
  const select = document.createElement('select'); select.className='select';
  ['','neon-overdrive','crt-glitch','void'].forEach(v=>{
    const o=document.createElement('option'); o.value=v; o.textContent=v||'default'; select.appendChild(o);
  });
  const save = btn('Apply');
  save.addEventListener('click', ()=>{
    const persist = !!cfg.secret.PERSIST_THEMES; setTheme(select.value, persist);
    unlock('Changed theme');
  });
  row.append(select, save);
  wrap.appendChild(row);
  wrap.appendChild(el('div','muted','Themes are temporary unless persisted by config.'));
  return wrap;
}

function makeAchievements() {
  const wrap = el('div');
  const list = el('ul');
  Array.from(achievements).forEach(a=>{ const li=el('li', null, '• '+a); list.appendChild(li); });
  if (!list.childElementCount) wrap.appendChild(el('div','muted','No achievements yet.'));
  else wrap.appendChild(list);
  return wrap;
}

function makeHiddenLinks(cfg) {
  const wrap = el('div');
  if (!cfg.secret.SHOW_HIDDEN_LINKS) { wrap.appendChild(el('div','muted','Hidden links are disabled.')); return wrap; }
  const links = [
    { label:'Dev Tools', href:'#dev-tools' },
    { label:'Staging Page', href:'#staging' },
  ];
  links.forEach(l=>{ const a=document.createElement('a'); a.href=l.href; a.textContent=l.label; a.target='_blank'; a.rel='noopener'; wrap.appendChild(a); wrap.appendChild(document.createElement('br')); });
  return wrap;
}

function makeGames() {
  const wrap = el('div','grid cols-2');
  const snakeCanvas = document.createElement('canvas'); snakeCanvas.className='vgame';
  wrap.appendChild(snakeCanvas);
  snake(snakeCanvas);
  const tCanvas = document.createElement('canvas'); tCanvas.className='vgame';
  wrap.appendChild(tCanvas);
  tetrisLite(tCanvas);
  return wrap;
}

function snake(canvas) {
  const ctx = canvas.getContext('2d'); let W=canvas.width=480,H=canvas.height=260; let cw=20, cols=Math.floor(W/cw), rows=Math.floor(H/cw);
  let snake=[[5,5]], dir=[1,0], food=[10,7], running=true, score=0;
  function placeFood(){ food=[Math.floor(Math.random()*cols), Math.floor(Math.random()*rows)]; }
  function step(){ if(!running) return; const head=[(snake[0][0]+dir[0]+cols)%cols,(snake[0][1]+dir[1]+rows)%rows];
    if (snake.some(([x,y])=>x===head[0]&&y===head[1])) { running=false; unlock('Found the Snake'); }
    snake.unshift(head);
    if (head[0]===food[0]&&head[1]===food[1]) { score++; placeFood(); } else snake.pop();
    draw();
  }
  function draw(){ ctx.clearRect(0,0,W,H); ctx.fillStyle='rgba(0,0,0,.2)'; ctx.fillRect(0,0,W,H);
    ctx.fillStyle='#00ffc8'; snake.forEach(([x,y])=>ctx.fillRect(x*cw,y*cw,cw-2,cw-2));
    ctx.fillStyle='#34d399'; ctx.fillRect(food[0]*cw,food[1]*cw,cw-2,cw-2);
    ctx.fillStyle='#aee7df'; ctx.fillText('Score '+score, 6, 14);
  }
  let t=setInterval(step,130);
  function onKey(e){ if(e.key==='ArrowUp') dir=[0,-1]; else if(e.key==='ArrowDown') dir=[0,1]; else if(e.key==='ArrowLeft') dir=[-1,0]; else if(e.key==='ArrowRight') dir=[1,0]; }
  window.addEventListener('keydown', onKey);
  canvas._destroy = ()=>{ clearInterval(t); window.removeEventListener('keydown', onKey); };
}

function tetrisLite(canvas) {
  const ctx=canvas.getContext('2d'); let W=canvas.width=480,H=canvas.height=260; const COLS=10, ROWS=18, S=24; let grid=Array.from({length:ROWS},()=>Array(COLS).fill(0));
  const shapes=[[[1,1,1,1]], [[1,1],[1,1]], [[0,1,0],[1,1,1]], [[1,0,0],[1,1,1]], [[0,0,1],[1,1,1]]];
  let p=newPiece(), x=3,y=0,tick=0,score=0,run=true;
  function newPiece(){ return shapes[Math.floor(Math.random()*shapes.length)]; }
  function collide(px,py,pp){ for(let r=0;r<pp.length;r++) for(let c=0;c<pp[0].length;c++) if(pp[r][c]&& (py+r>=ROWS||px+c<0||px+c>=COLS||grid[py+r][px+c])) return true; return false; }
  function merge(px,py,pp){ for(let r=0;r<pp.length;r++) for(let c=0;c<pp[0].length;c++) if(pp[r][c]) grid[py+r][px+c]=1; }
  function rot(pp){ return pp[0].map((_,i)=>pp.map(r=>r[i]).reverse()); }
  function clearLines(){ for(let r=ROWS-1;r>=0;r--){ if(grid[r].every(v=>v)){ grid.splice(r,1); grid.unshift(Array(COLS).fill(0)); score+=100; r++; } } }
  function draw(){ ctx.clearRect(0,0,W,H); ctx.fillStyle='rgba(0,0,0,.2)'; ctx.fillRect(0,0,W,H);
    for(let r=0;r<ROWS;r++) for(let c=0;c<COLS;c++){ if(grid[r][c]){ ctx.fillStyle='#00ffc8'; ctx.fillRect(c*S,r*S,S-2,S-2);} }
    ctx.fillStyle='#aee7df'; for(let r=0;r<p.length;r++) for(let c=0;c<p[0].length;c++) if(p[r][c]) ctx.fillRect((x+c)*S,(y+r)*S,S-2,S-2);
    ctx.fillStyle='#aee7df'; ctx.fillText('Score '+score, 6, 14);
  }
  function step(){ if(!run) return; if(++tick%20===0){ if(!collide(x,y+1,p)){ y++; } else { merge(x,y,p); clearLines(); p=newPiece(); x=3; y=0; if(collide(x,y,p)){ run=false; unlock('Beat Tetris 1000 pts'); } } draw(); } }
  let timer=setInterval(step,16);
  function onKey(e){ if(!run) return; if(e.key==='ArrowLeft' && !collide(x-1,y,p)) x--; else if(e.key==='ArrowRight' && !collide(x+1,y,p)) x++; else if(e.key==='ArrowUp'){ const np=rot(p); if(!collide(x,y,np)) p=np; } else if(e.key==='ArrowDown'){ if(!collide(x,y+1,p)) y++; }
    draw(); }
  window.addEventListener('keydown', onKey);
  canvas._destroy = ()=>{ clearInterval(timer); window.removeEventListener('keydown', onKey); };
}

function setContent(node) { content.innerHTML=''; content.appendChild(node); }

function buildUI(cfg){
  overlay = el('div','vault-overlay');
  panel = el('div','vault-panel');
  const header = el('div','vault-header');
  const title = el('div','vault-title','Easter Egg Vault');
  const spacer = el('div','vault-spacer');
  const closeB = btn('Close','vault-close');
  header.append(title, spacer, closeB);
  const body = el('div','vault-body');
  nav = el('div','vault-nav');
  content = el('div','vault-content');
  body.append(nav, content); panel.append(header, body); overlay.append(panel); document.body.appendChild(overlay);

  function addTab(name, nodeFn){
    const b=btn(name,'vault-tab');
    b.addEventListener('click',()=>{ [...nav.children].forEach(x=>x.classList.remove('active')); b.classList.add('active'); setContent(nodeFn()); });
    nav.appendChild(b);
    return b;
  }

  const t1 = addTab('ASCII-Gallery', makeAsciiGallery);
  const t2 = addTab('Mini-Games', ()=>makeGames());
  const t3 = addTab('Secret Themes', ()=>makeThemes(cfg));
  const t4 = addTab('Soundboard', ()=>makeSoundboard(cfg));
  const t5 = addTab('Achievements', makeAchievements);
  const t6 = addTab('Hidden Links', ()=>makeHiddenLinks(cfg));
  t1.classList.add('active'); setContent(makeAsciiGallery());

  function onClose(){
    overlay.classList.remove('active');
    content.querySelectorAll('canvas.vgame').forEach(c=> c._destroy && c._destroy());
    if (lastFocused) lastFocused.focus();
  }
  closeB.addEventListener('click', onClose);
  overlay.addEventListener('click', (e)=>{ if (e.target===overlay) onClose(); });
  window.addEventListener('keydown', (e)=>{ if (overlay.classList.contains('active') && e.key==='Escape') onClose(); });
  window.addEventListener('keydown', trapFocus);

  focusables = Array.from(panel.querySelectorAll('button, [href], select, textarea, [tabindex]:not([tabindex="-1"])'));
  lastFocused = document.activeElement;
  focusables[0]?.focus();

  loadPersistedTheme();
}

export function openVault({ config }){
  if (!overlay) buildUI(config);
  overlay.classList.add('active');
  unlock('Typed sudo secret');
}
