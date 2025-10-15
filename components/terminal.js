import { config } from '../assets/config.js';
const TYPE_SPEED_FACTOR = 0.6;

const title = 'maro@run:~$';
const isMobile = matchMedia('(pointer: coarse)').matches || window.innerWidth < 768;

function createEl(tag, cls, text) {
  const el = document.createElement(tag);
  if (cls) el.className = cls;
  if (text != null) el.textContent = text;
  return el;
}

let _persist = { lines: [] };
function persistAdd(t){
  try{
    _persist.lines.push(t);
    if (_persist.lines.length > 800) {
      _persist.lines.splice(0, _persist.lines.length - 800);
    }
    localStorage.setItem('maro_term', JSON.stringify(_persist));
  }catch(_){ }
}

function typeLine(container, text, speed = 36) {
  return new Promise(resolve => {
    const line = createEl('div', 'line');
    container.appendChild(line);
    let i = 0;
    const tick = () => {
      line.textContent = text.slice(0, i++);
      container.scrollTop = container.scrollHeight;
      if (i <= text.length) {
        setTimeout(tick, Math.max(8, Math.floor(speed * TYPE_SPEED_FACTOR)));
      } else {
        persistAdd(line.textContent || '');
        resolve();
      }
    };
    tick();
  });
}

function typeLines(container, lines, speed = 36) {
  return lines.reduce((p, ln) => p.then(() => typeLine(container, ln, speed)), Promise.resolve());
}

function buildOverlay() {
  const overlay = createEl('div', 'terminal-overlay');
  const win = createEl('div', 'terminal-window');
  const header = createEl('div', 'terminal-header');
  header.append(createEl('span', 'term-dot red'), createEl('span', 'term-dot yellow'), createEl('span', 'term-dot green'));
  header.append(createEl('span', 'term-title', 'Maro Terminal — Ctrl + ` to close'));

  const body = createEl('div', 'terminal-body');
  const inputWrap = createEl('div', 'terminal-input');
  const prompt = createEl('span', 'prompt', `${title} `);
  const text = createEl('span', 'input-text');
  const cursor = createEl('span', 'cursor block blink');

  inputWrap.append(prompt, text, cursor);
  win.append(header, body, inputWrap);
  overlay.append(win);
  document.body.appendChild(overlay);

  return { overlay, body, text, cursor, inputWrap };
}

function buildToggle() {
  const btn = createEl('button', 'terminal-toggle', 'Terminal');
  btn.title = 'Open Terminal (Ctrl + `)';
  document.body.appendChild(btn);
  return btn;
}

function openOverlay(state) {
  state.overlay.classList.add('active');
  state.text.dataset.active = '1';
}
function closeOverlay(state) {
  state.overlay.classList.remove('active');
  state.text.dataset.active = '';
}

function socialsLines() {
  return [
    'socials:',
    ' - X      : https://x.com/maro',
    ' - Insta  : https://instagram.com/maro',
    ' - Discord: https://discord.com/users/1109040058843025519',
    ' - Steam  : https://steamcommunity.com/profiles/76561199068188141/',
  ];
}

function contactLines() {
  return [
    'contact:',
    ' Discord: https://discord.com/users/1109040058843025519',
    ' Steam  : https://steamcommunity.com/profiles/76561199068188141/',
  ];
}

export function initTerminal() {
  const state = buildOverlay();
  const toggle = buildToggle();

  const speed = 36;
  const history = [];
  let histIdx = -1;
  let buffer = '';
  let open = false;
  let mode = null;
  let matrixHolder = { matrix: null };

  if (isMobile) {
    const ro = createEl('span', 'term-ro', 'read-only on mobile');
    state.overlay.querySelector('.terminal-header')?.appendChild(ro);
  }

  function show() { open = true; openOverlay(state); runIntro(); }
  function hide() { open = false; closeOverlay(state); }
  toggle.addEventListener('click', () => (open ? hide() : show()));

  window.addEventListener('keydown', (e) => {
    if (e.ctrlKey && (e.code === 'Backquote' || e.key === '`')) {
      e.preventDefault();
      open ? hide() : show();
    }
  });

  function syncInput() {
    state.text.textContent = buffer;
    state.cursor.classList.toggle('blink', buffer.length % 2 === 0);
  }

  function println(line = '') {
    const el = createEl('div', 'line');
    el.textContent = line;
    state.body.appendChild(el);
    state.body.scrollTop = state.body.scrollHeight;
    persistAdd(line);
  }

  let introRan = false;
  async function runIntro(){
    if (introRan) return; introRan = true;
    try {
      const saved = JSON.parse(localStorage.getItem('maro_term')||'null');
      if (saved?.lines?.length) {
        _persist = saved;
        for (const ln of saved.lines) { const l=createEl('div','line'); l.textContent=ln; state.body.appendChild(l); }
        await typeLines(state.body, ['session restored'], speed);
      }
    } catch(_){}
    await typeLines(state.body, ['initializing maro.run ...'], speed); await wait(1000);
    await typeLines(state.body, ['connecting to gothlab systems ...'], speed); await wait(1000);
    await typeLines(state.body, ['online.'], speed);
  }
  function wait(ms){ return new Promise(r=>setTimeout(r,ms)); }

  let registry = null;
  async function loadCommands(){
    if (registry) return registry;
    try{ const res = await fetch('components/cli/commands/commands.json', { cache:'no-store' }); registry = await res.json(); }
    catch{ registry = []; }
    return registry;
  }

  async function showHelp(){
    const builtins = [
      { name:'help', desc:'show this help' },
      { name:'about', desc:'who is Maro' },
      { name:'socials', desc:'links to socials' },
      { name:'contact', desc:'how to reach' },
      { name:'clear', desc:'clear the terminal' },
      { name:'exit', desc:'close terminal' },
      { name:'sudo secret', desc:'open secret vault' },
    ];
    const reg = await loadCommands();
    const lines = ['Available commands:']
      .concat(builtins.map(c=>` ${c.name.padEnd(12)} - ${c.desc}`))
      .concat(reg.map(c=>` ${c.name.padEnd(12)} - ${c.desc}`));
    await typeLines(state.body, lines, speed);
  }

  function makeCtx(){
    return {
      body: state.body,
      typeLines: (lines, spd=speed)=>typeLines(state.body, lines, spd),
      bindMode: (m)=>{ mode = m; },
      unbindMode: ()=>{ mode = null; },
    };
  }

  async function dispatch(c){
    
    if (c === 'pause' || c === 'resume') { const m = await import('./cli/commands/music.js'); await m.run(c, makeCtx()); return true; }
    const reg = await loadCommands();
    let hit = reg.find(r => r.name === c);
    if (!hit) {
      if (c.startsWith('trace')) hit = reg.find(r=>r.name==='trace');
      else if (c.startsWith('theme')) hit = reg.find(r=>r.name==='theme');
      else if (c==='play lofi' || c==='play lo-fi') hit = reg.find(r=>r.name==='play lo-fi');
    }
    if (!hit) return false;
    if (hit.name === 'matrix') {
      const path = `./cli/commands/${String(hit.module).replace(/^\.\//,'')}`;
      const mod = await import(path);
      
      matrixHolder = { matrix: null };
      mod.bind?.(matrixHolder);
      await mod.run(c, makeCtx());
      return true;
    }
    const path = `./cli/commands/${String(hit.module).replace(/^\.\//,'')}`;
    const mod = await import(path);
    await mod.run(c, makeCtx());
    return true;
  }

  async function handleSudoSecret(cmd) {
    if (cmd.includes('--hint')) {
      const hint = config?.secret?.SECRET_HINT || 'hint: check the first commit message';
      await typeLines(state.body, [hint], speed);
      return;
    }
    if (cmd.includes('--rick')) {
      const banner = [
        '  _   _  ____  _  __ _  __   ____       _      _ _ _',
        ' | \\ | |/ __ \\| |/ _` |/ _| |  _ \\ _ __(_)_ __(_) | |',
        " |  \\| | |  | | | (_| | |_  | |_) | '__| | '__| | | |",
        ' | |\\  | |__| | |\\__,_|  _| |  __/| |  | | |  | | | |',
        ' |_| \\_|\\____/|_|     |_|   |_|   |_|  |_|_|  |_|_|_|',
        ' never gonna give you up — ascii edition'
      ];
      await typeLines(state.body, banner, 10);
      return;
    }
    if (isMobile && !config.secret.ENABLE_MOBILE_EASTER) {
      await typeLines(state.body, ['Mobile Easter Eggs disabled by config.'], speed);
      return;
    }
    await typeLines(state.body, ['Opening vault...'], speed);
    const mod = await import('./secretVault.js');
    mod.openVault({ config });
    try { const a = await import('./achievements.js'); a.unlockAchievement('vault_access'); } catch(_){ }
  }

  async function run(cmd) {
    const c = (cmd || '').trim();
    if (!c) return;
    
    await typeLines(state.body, [`${title} ${c}`], speed);

    
    if (c.toLowerCase() === 'exit matrix' && matrixHolder && matrixHolder.matrix && matrixHolder.matrix.stop) {
      matrixHolder.matrix.stop();
      matrixHolder = { matrix: null };
      await typeLines(state.body, ['[matrix] exited'], speed);
      return;
    }

    switch (c.toLowerCase()) {
      case 'help': await showHelp(); break;
      case 'about': await typeLines(state.body, ['Maro — Developer & Maker'], speed); break;
      case 'socials': await typeLines(state.body, socialsLines(), speed); break;
      case 'contact': await typeLines(state.body, contactLines(), speed); break;
      case 'clear': state.body.innerHTML = ''; break;
      case 'exit': hide(); break;
      default:
        if (c.startsWith('sudo secret')) { await handleSudoSecret(c); break; }
        if (await dispatch(c)) break;
        await typeLines(state.body, [`${c}: command not found`], speed);
        break;
    }
  }

  window.addEventListener('keydown', async (e) => {
    if (!open) return;
    const ignore = ['Tab'];
    if (ignore.includes(e.key)) { e.preventDefault(); return; }

    
    if (e.ctrlKey && (e.key === 'c' || e.key === 'C')) {
      e.preventDefault();
      await typeLines(state.body, ['^C'], 18);
      if (mode?.onInput) { mode = null; }
      if (matrixHolder && matrixHolder.matrix && typeof matrixHolder.matrix.stop === 'function') {
        matrixHolder.matrix.stop();
        matrixHolder = { matrix: null };
      }
      try { window.dispatchEvent(new CustomEvent('terminal:interrupt')); } catch(_){}
      buffer = '';
      syncInput();
      return;
    }

    if (isMobile) {
      if (e.key === 'Escape') hide();
      return;
    }

    state.inputWrap.classList.add('typing');
    clearTimeout(state._typingT);
    state._typingT = setTimeout(() => state.inputWrap.classList.remove('typing'), 150);

    if (e.key === 'Enter') {
      e.preventDefault();
      if (mode?.onInput) {
        const cmd = buffer; buffer=''; syncInput(); mode.onInput(cmd); return;
      }
      history.push(buffer);
      histIdx = history.length;
      const cmd = buffer; buffer = ''; syncInput(); run(cmd);
      return;
    }
    if (e.key === 'Backspace') {
      e.preventDefault(); buffer = buffer.slice(0, -1); syncInput(); return;
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault(); if (histIdx > 0) { histIdx--; buffer = history[histIdx] || ''; syncInput(); } return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault(); if (histIdx < history.length) { histIdx++; buffer = history[histIdx] || ''; syncInput(); } return;
    }

    if (e.key.length === 1 && !e.metaKey && !e.ctrlKey && !e.altKey) {
      e.preventDefault(); buffer += e.key; syncInput(); return;
    }
    if (e.key === 'Escape') { hide(); return; }
  });
}

 
initTerminal();
