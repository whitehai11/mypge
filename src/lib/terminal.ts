// @ts-nocheck
import { config } from './config';
import commandRegistry from './cli/commands/commands.json';

const TYPE_SPEED_FACTOR = 0.6;
const USER = 'maro';
const HOST = 'void';
const HOME_PATH = '/home/maro';

const DIR = (children = {}) => ({ type: 'dir', children });
const FILE = (content = '') => ({ type: 'file', content });

const VFS_ROOT = DIR({
  home: DIR({
    maro: DIR({
      'README.txt': FILE('Welcome to the Maro shell.\\nCustom commands still work - try `help`, `ls`, `pwd`, `history` or any of the neon tools.'),
      projects: DIR({
        'guns.log': FILE('guns.lol build scripts, neon themes, and CLI experiments'),
        'ai-notes.md': FILE('> idea: fuse retro terminals with modern neon gradients.\n> todo: ship more easter eggs.'),
      }),
      logs: DIR({
        'system.log': FILE(
          '[boot] neon kernel ready\n[net] ghost relay online\n[secret] sudo secret --hint  # you know the drill.'
        ),
      }),
      '.shellrc': FILE('alias ll="ls"\nexport EDITOR=nano'),
    }),
  }),
  etc: DIR({
    motd: FILE('All systems nominal. Welcome back, captain.'),
    hosts: FILE('127.0.0.1 localhost\n255.255.255.255 broadcasthost'),
  }),
  var: DIR({
    tmp: DIR({}),
  }),
});

const linuxCommandNames = ['ls', 'll', 'cd', 'pwd', 'cat', 'history', 'whoami', 'hostname', 'uname', 'echo'];

const isMobile = typeof window !== 'undefined'
  ? (window.matchMedia?.('(pointer: coarse)').matches || window.innerWidth < 768)
  : false;
let terminalInitialized = false;
let cwd = HOME_PATH;
let previousCwd = HOME_PATH;

function formatPathLabel(path) {
  if (path === HOME_PATH) return '~';
  if (path.startsWith(HOME_PATH)) {
    const rest = path.slice(HOME_PATH.length) || '/';
    return `~${rest}`;
  }
  return path || '/';
}

function resolvePath(input = '.') {
  if (!input || input === '~') return HOME_PATH;
  let target = input;
  if (target.startsWith('~')) {
    target = HOME_PATH + target.slice(1);
  }
  const base = target.startsWith('/') ? '/' : cwd;
  const stack = base === '/' ? [] : base.split('/').filter(Boolean);
  const parts = target.split('/').filter(Boolean);
  for (const part of parts) {
    if (part === '.' || part === '') continue;
    if (part === '..') stack.pop();
    else stack.push(part);
  }
  return '/' + stack.join('/');
}

function getNode(path) {
  if (path === '/') return VFS_ROOT;
  const parts = path.split('/').filter(Boolean);
  let node = VFS_ROOT;
  for (const part of parts) {
    if (!node.children || !node.children[part]) return null;
    node = node.children[part];
  }
  return node;
}

function listEntries(path) {
  const node = getNode(path);
  if (!node || node.type !== 'dir') return null;
  return Object.keys(node.children || {}).sort((a, b) => a.localeCompare(b));
}

function tokenize(input) {
  const tokens = [];
  let current = '';
  let quote = null;
  for (let i = 0; i < input.length; i += 1) {
    const ch = input[i];
    if (quote) {
      if (ch === '\\' && i + 1 < input.length) {
        current += input[i + 1];
        i += 1;
        continue;
      }
      if (ch === quote) {
        quote = null;
        continue;
      }
      current += ch;
      continue;
    }
    if (ch === '"' || ch === "'") {
      quote = ch;
      continue;
    }
    if (/\s/.test(ch)) {
      if (current) {
        tokens.push(current);
        current = '';
      }
      continue;
    }
    if (ch === '\\' && i + 1 < input.length) {
      current += input[i + 1];
      i += 1;
      continue;
    }
    current += ch;
  }
  if (current) tokens.push(current);
  return tokens;
}

function createEl(tag, cls, text) {
  const el = document.createElement(tag);
  if (cls) el.className = cls;
  if (text != null) el.textContent = text;
  return el;
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
  header.append(createEl('span', 'term-title', `${USER}@${HOST} - bash (Ctrl + \``));

  const body = createEl('div', 'terminal-body');
  const inputWrap = createEl('div', 'terminal-input');
  const prompt = createEl('span', 'prompt', '');
  const text = createEl('span', 'input-text');
  const cursor = createEl('span', 'cursor block blink');
  const hiddenInput = document.createElement('textarea');
  hiddenInput.className = 'terminal-hidden-input';
  hiddenInput.setAttribute('rows', '1');
  hiddenInput.setAttribute('autocomplete', 'off');
  hiddenInput.setAttribute('autocorrect', 'off');
  hiddenInput.setAttribute('autocapitalize', 'none');
  hiddenInput.spellcheck = false;

  inputWrap.append(prompt, text, cursor, hiddenInput);
  win.append(header, body, inputWrap);
  overlay.append(win);
  document.body.appendChild(overlay);

  return { overlay, body, text, cursor, inputWrap, prompt, hiddenInput };
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
  if (terminalInitialized) return;
  if (typeof document === 'undefined') return;
  terminalInitialized = true;
  const state = buildOverlay();
  const toggle = buildToggle();
  const hiddenInput = state.hiddenInput;
  let suppressInputSync = false;
  const focusInput = () => {
    setTimeout(() => {
      try { hiddenInput.focus({ preventScroll: true }); } catch(_){}
    }, 0);
  };
  const blurInput = () => {
    try { hiddenInput.blur(); } catch(_){}
  };
  function indicateTyping() {
    state.inputWrap.classList.add('typing');
    clearTimeout(state._typingT);
    state._typingT = setTimeout(() => state.inputWrap.classList.remove('typing'), 150);
  }
  const commandNameSet = new Set([
    ...linuxCommandNames,
    'help',
    'about',
    'socials',
    'contact',
    'clear',
    'exit',
    'sudo',
    'sudo secret',
  ]);
  (Array.isArray(commandRegistry) ? commandRegistry : []).forEach((cmd) => {
    const name = String(cmd?.name || '').toLowerCase();
    if (name) commandNameSet.add(name);
  });
  const commandNameList = Array.from(commandNameSet).sort();

  const speed = 36;
  const history = [];
  let histIdx = -1;
  let buffer = '';
  let open = false;
  let mode = null;
  let matrixHolder = { matrix: null };

  function formatPromptString() {
    return `${USER}@${HOST}:${formatPathLabel(cwd)}$`;
  }
  function refreshPrompt() {
    state.prompt.textContent = `${formatPromptString()} `;
  }
  refreshPrompt();

  function resetTerminal() {
    buffer = '';
    history.length = 0;
    histIdx = -1;
    mode = null;
    matrixHolder = { matrix: null };
    introRan = false;
    state.body.innerHTML = '';
    syncInput();
    blurInput();
    try { window.dispatchEvent(new CustomEvent('terminal:interrupt')); } catch(_){}
  }

  function show() { open = true; openOverlay(state); runIntro(); focusInput(); }
  function hide() { open = false; closeOverlay(state); resetTerminal(); }
  toggle.addEventListener('click', () => (open ? hide() : show()));

  window.addEventListener('keydown', (e) => {
    if (e.ctrlKey && (e.code === 'Backquote' || e.key === '`')) {
      e.preventDefault();
      open ? hide() : show();
    }
  });

  

  state.overlay.addEventListener('mousedown', () => focusInput());
  state.body.addEventListener('mousedown', (event) => {
    event.stopPropagation();
    focusInput();
  });
  state.inputWrap.addEventListener('mousedown', (event) => {
    event.stopPropagation();
    focusInput();
  });
  syncInput();

  function syncInput() {
    state.text.textContent = buffer;
    state.cursor.classList.toggle('blink', buffer.length % 2 === 0);
    suppressInputSync = true;
    hiddenInput.value = buffer;
    try { hiddenInput.setSelectionRange(buffer.length, buffer.length); } catch(_){}
    suppressInputSync = false;
  }

  hiddenInput.addEventListener('input', () => {
    if (!open || suppressInputSync) return;
    buffer = hiddenInput.value;
    state.text.textContent = buffer;
    state.cursor.classList.toggle('blink', buffer.length % 2 === 0);
    indicateTyping();
  });
  hiddenInput.addEventListener('focus', () => {
    try { hiddenInput.setSelectionRange(buffer.length, buffer.length); } catch(_){}
  });
  hiddenInput.addEventListener('keydown', handleKeyDown);

  function println(line = '') {
    const el = createEl('div', 'line');
    el.textContent = line;
    state.body.appendChild(el);
    state.body.scrollTop = state.body.scrollHeight;
  }

  let introRan = false;
  async function runIntro(){
    if (introRan) return; introRan = true;
    const now = new Date();
    await typeLines(state.body, [`Linux ${HOST} 6.2.0-neon #1 SMP PREEMPT x86_64`], speed);
    await typeLines(
      state.body,
      [`Last login: ${now.toString()} on pts/0 from 127.0.0.1`],
      speed
    );
    await typeLines(state.body, ['Welcome to neon shell. Type `help` to list commands.'], speed);
  }
  function wait(ms){ return new Promise(r=>setTimeout(r,ms)); }

  let registry = null;
  async function loadCommands(){
    if (registry) return registry;
    registry = Array.isArray(commandRegistry) ? commandRegistry : [];
    return registry;
  }

  async function showHelp(){
    const builtins = [
      { name:'help', desc:'show this help' },
      { name:'about', desc:'who is Maro' },
      { name:'socials', desc:'links to socials' },
      { name:'contact', desc:'how to reach' },
      { name:'clear', desc:'clear terminal output' },
      { name:'exit', desc:'close terminal overlay' },
      { name:'sudo secret', desc:'open secret vault' },
      { name:'pwd', desc:'print current directory' },
      { name:'ls', desc:'list files in a directory' },
      { name:'cd', desc:'change directories' },
      { name:'cat', desc:'print file contents' },
      { name:'history', desc:'show recent commands' },
      { name:'whoami', desc:'current user' },
      { name:'hostname', desc:'host name' },
      { name:'uname', desc:'kernel info' },
      { name:'echo', desc:'print text' },
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

  async function handleLinuxCommand(command, args) {
    switch (command) {
      case 'pwd':
        await typeLines(state.body, [cwd], speed);
        return true;
      case 'ls': {
        const target = args.find(a => !a.startsWith('-')) || '.';
        const resolved = resolvePath(target);
        const node = getNode(resolved);
        if (!node) {
          await typeLines(state.body, [`ls: cannot access '${target}': No such file or directory`], speed);
          return true;
        }
        if (node.type === 'file') {
          await typeLines(state.body, [target], speed);
          return true;
        }
        const entries = listEntries(resolved) || [];
        const decorated = entries.map((name) => {
          const child = node.children?.[name];
          if (child?.type === 'dir') return `${name}/`;
          if (name.startsWith('.')) return name;
          return name;
        });
        await typeLines(state.body, [decorated.join('  ') || '.'], speed);
        return true;
      }
      case 'cd': {
        const target = args[0] || '~';
        let destination;
        if (target === '-') {
          destination = previousCwd;
        } else {
          destination = resolvePath(target);
        }
        const node = getNode(destination);
        if (!node) {
          await typeLines(state.body, [`cd: no such file or directory: ${target}`], speed);
          return true;
        }
        if (node.type !== 'dir') {
          await typeLines(state.body, [`cd: ${target}: Not a directory`], speed);
          return true;
        }
        previousCwd = cwd;
        cwd = destination || '/';
        refreshPrompt();
        return true;
      }
      case 'cat': {
        const fileTarget = args[0];
        if (!fileTarget) {
          await typeLines(state.body, ['cat: missing file operand'], speed);
          return true;
        }
        const resolved = resolvePath(fileTarget);
        const node = getNode(resolved);
        if (!node) {
          await typeLines(state.body, [`cat: ${fileTarget}: No such file or directory`], speed);
          return true;
        }
        if (node.type !== 'file') {
          await typeLines(state.body, [`cat: ${fileTarget}: Is a directory`], speed);
          return true;
        }
        const lines = String(node.content || '').split('\n');
        await typeLines(state.body, lines.length ? lines : [''], speed);
        return true;
      }
      case 'history': {
        const start = Math.max(history.length - 50, 0);
        const lines = history.slice(start).map((entry, idx) => `${String(start + idx + 1).padStart(2, ' ')}  ${entry}`);
        await typeLines(state.body, lines.length ? lines : ['history: empty'], speed);
        return true;
      }
      case 'whoami':
        await typeLines(state.body, [USER], speed);
        return true;
      case 'hostname':
        await typeLines(state.body, [HOST], speed);
        return true;
      case 'uname':
        await typeLines(state.body, [`Linux ${HOST} 6.2.0-neon #1 SMP PREEMPT x86_64 GNU/Linux`], speed);
        return true;
      case 'echo':
        await typeLines(state.body, [args.join(' ')], speed);
        return true;
      case 'll':
        return handleLinuxCommand('ls', args);
      default:
        return false;
    }
  }

  async function handleKeyDown(e) {
    if (!open) return;
    const key = e.key;
    const ctrlKey = e.ctrlKey || e.metaKey;

    if (!['Shift', 'Alt', 'Meta'].includes(key)) {
      indicateTyping();
    }

    if (ctrlKey && (key === 'c' || key === 'C')) {
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

    if (ctrlKey && (key === 'l' || key === 'L')) {
      e.preventDefault();
      state.body.innerHTML = '';
      buffer = '';
      syncInput();
      return;
    }

    if (key === 'Tab') {
      e.preventDefault();
      if (buffer.startsWith('sudo ')) {
        const after = buffer.slice(5);
        if (after.includes(' ')) return;
        const prefix = after.trim().toLowerCase();
        const matches = commandNameList.filter((name) => name.startsWith(prefix));
        if (!prefix && matches.length) {
          await typeLines(state.body, [matches.join('  ')], 18);
        } else if (matches.length === 1) {
          buffer = `sudo ${matches[0]} `;
          syncInput();
        } else if (matches.length > 1) {
          await typeLines(state.body, [matches.join('  ')], 18);
        }
        return;
      }
      if (buffer.includes(' ')) return;
      const prefix = buffer.trim().toLowerCase();
      const matches = commandNameList.filter((name) => name.startsWith(prefix));
      if (!prefix && matches.length) {
        await typeLines(state.body, [matches.join('  ')], 18);
      } else if (matches.length === 1) {
        buffer = `${matches[0]} `;
        syncInput();
      } else if (matches.length > 1) {
        await typeLines(state.body, [matches.join('  ')], 18);
      }
      return;
    }

    if (key === 'ArrowUp') {
      e.preventDefault();
      if (!history.length) return;
      if (histIdx === -1) histIdx = history.length;
      if (histIdx > 0) {
        histIdx--;
        buffer = history[histIdx] || '';
        syncInput();
      }
      return;
    }

    if (key === 'ArrowDown') {
      e.preventDefault();
      if (!history.length) return;
      if (histIdx === -1) {
        buffer = '';
        syncInput();
        return;
      }
      histIdx++;
      if (histIdx >= history.length) {
        buffer = '';
        histIdx = history.length;
      } else {
        buffer = history[histIdx] || '';
      }
      syncInput();
      return;
    }

    if (key === 'Escape') {
      e.preventDefault();
      hide();
      return;
    }

    if (key === 'Enter') {
      e.preventDefault();
      const current = buffer;
      buffer = '';
      syncInput();
      if (mode?.onInput) {
        mode.onInput(current);
        return;
      }
      const trimmed = current.trim();
      if (!trimmed) {
        histIdx = history.length;
        return;
      }
      history.push(current);
      histIdx = history.length;
      await run(current);
      return;
    }
  }

  async function dispatch(c){
    const cl = c.toLowerCase();
    if (cl === 'pause' || cl === 'resume') { const m = await import('./cli/commands/music.js'); await m.run(cl, makeCtx()); return true; }
    const reg = await loadCommands();
    let hit = reg.find(r => String(r.name || '').toLowerCase() === cl);
    if (!hit) {
      if (cl.startsWith('trace')) hit = reg.find(r=>r.name==='trace');
      else if (cl.startsWith('theme')) hit = reg.find(r=>r.name==='theme');
      else if (cl==='play lofi' || cl==='play lo-fi') hit = reg.find(r=>r.name==='play lo-fi');
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
        ' |_| \\_|\\____/|_|     |_|   |_|   |_|  |_|_|  |_|_|_|',        ' never gonna give you up - ascii edition'
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
    try { const a = await import('./achievements'); a.unlockAchievement('vault_access'); } catch(_){ }
  }

  async function run(cmd) {
    const raw = (cmd || '').trim();
    if (!raw) return;

    await typeLines(state.body, [`${formatPromptString()} ${raw}`], speed);

    if (raw.toLowerCase() === 'exit matrix' && matrixHolder && matrixHolder.matrix && matrixHolder.matrix.stop) {
      matrixHolder.matrix.stop();
      matrixHolder = { matrix: null };
      await typeLines(state.body, ['[matrix] exited'], speed);
      return;
    }

    const tokens = tokenize(raw);
    const token = tokens.shift() || '';
    const command = token.toLowerCase();

    switch (command) {
      case 'help': await showHelp(); return;
      case 'about': await typeLines(state.body, ['Maro - Developer & Maker'], speed); return;
      case 'socials': await typeLines(state.body, socialsLines(), speed); return;
      case 'contact': await typeLines(state.body, contactLines(), speed); return;
      case 'clear': state.body.innerHTML = ''; return;
      case 'exit': hide(); return;
      default:
        if (raw.startsWith('sudo secret')) { await handleSudoSecret(raw); return; }
        if (await handleLinuxCommand(command, tokens)) return;
        if (await dispatch(raw)) return;
        await typeLines(state.body, [`${raw}: command not found`], speed);
        return;
    }
  }

  
}



