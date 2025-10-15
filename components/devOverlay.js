// Hidden Dev Overlay (Ctrl + D). Vanilla JS, glass panel with tabs

const BUILD_VERSION = '1.0.0';
let overlay = null; let panel = null; let open = false; let fps=0; let fpsInt=null; let start = performance.now();

function el(tag, cls, txt){ const e=document.createElement(tag); if(cls)e.className=cls; if(txt!=null)e.textContent=txt; return e; }

function build(){
  overlay = el('div','vault-overlay'); // reuse glass overlay style
  panel = el('div','vault-panel');
  const header = el('div','vault-header');
  header.append(el('div','vault-title','[dev overlay active]'));
  const close = el('button','vault-close','Close'); header.append(el('div','vault-spacer'), close);
  const body = el('div','vault-body'); const nav = el('div','vault-nav'); const content = el('div','vault-content');
  body.append(nav, content); panel.append(header, body); overlay.append(panel); document.body.appendChild(overlay);

  function tab(name, node){ const b=el('button','vault-tab',name); b.addEventListener('click',()=>{ [...nav.children].forEach(x=>x.classList.remove('active')); b.classList.add('active'); content.innerHTML=''; content.appendChild(node()); }); nav.appendChild(b); return b; }

  const t1 = tab('console', renderConsole);
  const t2 = tab('config', renderConfig);
  const t3 = tab('system', renderSystem);
  t1.classList.add('active'); content.appendChild(renderConsole());

  function closeOverlay(){ overlay.classList.remove('active'); open = false; document.removeEventListener('keydown', onKey); stopFps(); }
  function onKey(e){ if(e.key==='Escape'){ closeOverlay(); } }
  close.addEventListener('click', closeOverlay);
  overlay.addEventListener('click', (e)=>{ if(e.target===overlay) closeOverlay(); });

  function startFps(){ let last=performance.now(), frames=0; fpsInt=setInterval(()=>{ const now=performance.now(); fps = Math.round(frames*1000/(now-last)); last=now; frames=0; }, 1000); const loop=()=>{ frames++; if(open) requestAnimationFrame(loop); }; requestAnimationFrame(loop); }
  function stopFps(){ clearInterval(fpsInt); fpsInt=null; }

  function renderConsole(){
    const wrap = el('div');
    const pre = el('pre','ascii-block');
    // Extract recent terminal commands from stored lines
    let lines=[]; try{ const saved = JSON.parse(localStorage.getItem('maro_term')||'null'); lines = saved?.lines||[]; }catch(_){ }
    const cmds = lines.filter(l=>l.startsWith('maro@run:~$ ')).slice(-30);
    pre.textContent = cmds.join('\n');
    wrap.appendChild(pre);
    return wrap;
  }

  function setTheme(name){
    const clsList = ['theme-neon','theme-void','theme-retro','theme-solarized','theme-glass','theme-carbon','theme-light','theme-classic'];
    document.documentElement.classList.remove(...clsList); document.body.classList.remove(...clsList);
    if (name && name!=='classic'){ const cls='theme-'+name; document.documentElement.classList.add(cls); document.body.classList.add(cls); }
    try{ localStorage.setItem('maro_theme_cli', name);}catch(_){ }
    try { window.dispatchEvent(new CustomEvent('theme:changed', { detail: { name } })); } catch(_){ }
  }

  function renderConfig(){
    const wrap = el('div');
    const themes = ['classic','neon','void','retro','solarized','glass','carbon','light'];
    const row = el('div','row');
    const sel = el('select','select'); themes.forEach(t=>{ const o=document.createElement('option'); o.value=t; o.textContent=t; sel.appendChild(o); });
    const apply = el('button','btn','Apply'); apply.addEventListener('click', ()=> setTheme(sel.value));
    const unl = el('button','btn','Unlock: Matrix'); unl.addEventListener('click', async ()=>{ const m = await import('./achievements.js'); m.unlockAchievement('matrix_mode'); });
    row.append(sel, apply, unl); wrap.appendChild(row);
    return wrap;
  }

  function renderSystem(){
    const wrap = el('div');
    const theme = (localStorage.getItem('maro_theme_cli')||'classic');
    const ach = (()=>{ try{ return JSON.parse(localStorage.getItem('achievements')||'[]'); }catch(_){ return []; } })();
    const unlocked = ach.filter(a=>a.unlocked).length;
    const sizeKB = Math.round((new Blob(Object.values(localStorage)).size/1024)*10)/10;
    const up = formatUptime((performance.now()-start)/1000);
    const list = [
      `[dev overlay active]`,
      `user: anonymous`,
      `theme: ${theme}`,
      `achievements unlocked: ${unlocked} / ${ach.length}`,
      `localStorage size: ${sizeKB} KB`,
      `build version: ${BUILD_VERSION}`,
      `uptime: ${up}`,
      `fps: <live>`
    ];
    const pre = el('pre','ascii-block'); pre.textContent = list.join('\n');
    wrap.appendChild(pre);
    // Update FPS line
    open = true; startFps();
    const int = setInterval(()=>{ pre.textContent = list.join('\n').replace('<live>', String(fps)); if(!open) clearInterval(int); }, 500);
    return wrap;
  }

  function formatUptime(s){ const h=String(Math.floor(s/3600)).padStart(2,'0'); const m=String(Math.floor((s%3600)/60)).padStart(2,'0'); const ss=String(Math.floor(s%60)).padStart(2,'0'); return `${h}:${m}:${ss}`; }
}

function toggle(){ if(!overlay) build(); overlay.classList.toggle('active'); open = overlay.classList.contains('active'); }

document.addEventListener('keydown', (e)=>{ if (e.ctrlKey && String(e.key).toLowerCase()==='d'){ e.preventDefault(); toggle(); }});
