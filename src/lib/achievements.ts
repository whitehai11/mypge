const KEY = 'achievements';
const VER_KEY = 'achievements_version';
const VERSION = '1.1.0';

export type Achievement = {
  id: string;
  name: string;
  description: string;
  category: string;
  unlocked: boolean;
  icon: string;
  dateUnlocked: string | null;
};

const DEFAULTS: Achievement[] = [
  { id:'matrix_mode', name:'Matrix Initiated', description:'Entered the Matrix mode for the first time.', category:'Easter Eggs', unlocked:false, icon:'/assets/icons/matrix.svg', dateUnlocked:null },
  { id:'vault_access', name:'Easter Egg Vault', description:'Opened the secret vault.', category:'Easter Eggs', unlocked:false, icon:'/assets/icons/secret.svg', dateUnlocked:null },
  { id:'meltdown', name:'System Meltdown', description:'Triggered self-destruct (rm -rf /).', category:'System', unlocked:false, icon:'/assets/icons/meltdown.svg', dateUnlocked:null },
  { id:'theme_switch', name:'Chameleon', description:'Switched the site theme.', category:'System', unlocked:false, icon:'/assets/icons/theme.svg', dateUnlocked:null },
  { id:'chat_used', name:'Small Talk', description:'Used the chat command.', category:'Fun', unlocked:false, icon:'/assets/icons/chat.svg', dateUnlocked:null },
  { id:'tv_watched', name:'Broadcast Viewer', description:'Watched ASCII TV.', category:'Media', unlocked:false, icon:'/assets/icons/tv.svg', dateUnlocked:null },
  { id:'snake_master', name:'Snake Master', description:'Played the Snake mini game.', category:'Easter Eggs', unlocked:false, icon:'/assets/icons/secret.svg', dateUnlocked:null },
  { id:'flappy_pilot', name:'Flappy Pilot', description:'Played the Flappy mini game.', category:'Easter Eggs', unlocked:false, icon:'/assets/icons/secret.svg', dateUnlocked:null },
  { id:'pong_player', name:'Pong Player', description:'Played the Pong mini game.', category:'Easter Eggs', unlocked:false, icon:'/assets/icons/secret.svg', dateUnlocked:null },
  { id:'tetris_stack', name:'Tetris Stack', description:'Played the Tetris mini game.', category:'Easter Eggs', unlocked:false, icon:'/assets/icons/secret.svg', dateUnlocked:null },
  { id:'breakout_smash', name:'Breakout Smash', description:'Played the Breakout mini game.', category:'Easter Eggs', unlocked:false, icon:'/assets/icons/secret.svg', dateUnlocked:null },
  { id:'dodge_runner', name:'Dodge Runner', description:'Played the Dodge mini game.', category:'Easter Eggs', unlocked:false, icon:'/assets/icons/secret.svg', dateUnlocked:null },
  { id:'memory_solver', name:'Memory Solver', description:'Played the Memory mini game.', category:'Easter Eggs', unlocked:false, icon:'/assets/icons/secret.svg', dateUnlocked:null },
  { id:'runner_dash', name:'Runner Dash', description:'Played the Runner mini game.', category:'Easter Eggs', unlocked:false, icon:'/assets/icons/secret.svg', dateUnlocked:null },
  { id:'shooter_arcade', name:'Shooter Arcade', description:'Played the Shooter mini game.', category:'Easter Eggs', unlocked:false, icon:'/assets/icons/secret.svg', dateUnlocked:null },
  { id:'full_completion', name:'Completionist', description:'Unlocked all achievements (100%).', category:'Meta', unlocked:false, icon:'/assets/icons/theme.svg', dateUnlocked:null },
];

let achievementsInitialized = false;
let broadcast: BroadcastChannel | null = null;
try {
  broadcast = new BroadcastChannel('achievements');
} catch {
  broadcast = null;
}

function ensureInitialized() {
  if (achievementsInitialized) return;
  if (typeof window === 'undefined') return;
  initAchievements();
}

export function initAchievements() {
  if (achievementsInitialized) return;
  if (typeof window === 'undefined') return;
  achievementsInitialized = true;
  try {
    const stored = JSON.parse(window.localStorage.getItem(KEY) || '[]');
    const list: Achievement[] = Array.isArray(stored) ? stored : [];
    const filtered = list.filter((a) => a && typeof a.id === 'string' && !/^egg_\d+$/.test(a.id));
    const existing = new Set(filtered.map((item) => item.id));
    DEFAULTS.forEach((def) => {
      if (!existing.has(def.id)) {
        filtered.push({ ...def });
      }
    });
    window.localStorage.setItem(KEY, JSON.stringify(filtered));
    window.localStorage.setItem(VER_KEY, VERSION);
  } catch (error) {
    console.warn('[achievements] init failed', error);
  }
}

export function getAchievements(): Achievement[] {
  if (typeof window === 'undefined') return [];
  ensureInitialized();
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Achievement[]) : [];
  } catch {
    return [];
  }
}

export function saveAchievements(list: Achievement[]) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(list));
    notifyUpdate({ type: 'save' });
  } catch (error) {
    console.warn('[achievements] save failed', error);
  }
}

export function unlockAchievement(id: string) {
  const list = getAchievements();
  const ach = list.find((a) => a.id === id);
  if (!ach || ach.unlocked) return false;
  ach.unlocked = true;
  ach.dateUnlocked = new Date().toISOString();
  saveAchievements(list);
  showToast(ach);
  notifyUpdate({ type: 'unlock', id });
  if (id !== 'full_completion') {
    checkFullCompletion();
  }
  return true;
}

export function resetAchievements() {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(KEY);
    achievementsInitialized = false;
    initAchievements();
    notifyUpdate({ type: 'reset' });
  } catch (error) {
    console.warn('[achievements] reset failed', error);
  }
}

function ensureToastHost() {
  if (typeof document === 'undefined') return null;
  let host = document.getElementById('achv-toasts');
  if (!host) {
    host = document.createElement('div');
    host.id = 'achv-toasts';
    host.className = 'achv-toasts';
    document.body.appendChild(host);
  }
  return host;
}

function chime() {
  if (typeof window === 'undefined') return;
  try {
    const Ctx = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1320, ctx.currentTime + 0.15);
    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.2);
    osc.connect(gain).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.22);
  } catch {
    /* noop */
  }
}

export function showToast(ach: Achievement) {
  const host = ensureToastHost();
  if (!host) return;
  const item = document.createElement('div');
  item.className = 'achv-toast';
  item.innerHTML =
    '<div class="achv-head">achievement unlocked</div>' +
    '<div class="achv-name">' + ach.name + '</div>' +
    '<div class="achv-desc">' + ach.description + '</div>';
  host.appendChild(item);
  requestAnimationFrame(() => item.classList.add('show'));
  chime();
  setTimeout(() => {
    item.classList.remove('show');
    setTimeout(() => item.remove(), 300);
  }, 2600);
}

function notifyUpdate(payload: Record<string, unknown>) {
  try {
    broadcast?.postMessage(payload);
  } catch {
    /* noop */
  }
  try {
    window.dispatchEvent(new CustomEvent('achievements:updated', { detail: payload }));
  } catch {
    /* noop */
  }
}

function checkFullCompletion() {
  const list = getAchievements();
  const comp = list.find((a) => a.id === 'full_completion');
  if (!comp) return;
  const othersUnlocked = list.filter((a) => a.id !== 'full_completion').every((a) => a.unlocked);
  if (othersUnlocked && !comp.unlocked) {
    comp.unlocked = true;
    comp.dateUnlocked = new Date().toISOString();
    saveAchievements(list);
    showToast(comp);
    notifyUpdate({ type: 'unlock', id: 'full_completion' });
  }
}
