const KEY = 'achievements';
const VER_KEY = 'achievements_version';
const VERSION = '1.0.0';

const DEFAULTS = [
  { id:'matrix_mode', name:'Matrix Initiated', description:'Entered the Matrix mode for the first time.', category:'Easter Eggs', unlocked:false, icon:'assets/icons/matrix.svg', dateUnlocked:null },
  { id:'vault_access', name:'Easter Egg Vault', description:'Opened the secret vault.', category:'Easter Eggs', unlocked:false, icon:'assets/icons/secret.svg', dateUnlocked:null },
  { id:'meltdown', name:'System Meltdown', description:'Triggered self-destruct (rm -rf /).', category:'System', unlocked:false, icon:'assets/icons/meltdown.svg', dateUnlocked:null },
  { id:'theme_switch', name:'Chameleon', description:'Switched the site theme.', category:'System', unlocked:false, icon:'assets/icons/theme.svg', dateUnlocked:null },
  { id:'chat_used', name:'Small Talk', description:'Used the chat command.', category:'Fun', unlocked:false, icon:'assets/icons/chat.svg', dateUnlocked:null },
  { id:'tv_watched', name:'Broadcast Viewer', description:'Watched ASCII TV.', category:'Media', unlocked:false, icon:'assets/icons/tv.svg', dateUnlocked:null },
];

export function initAchievements(){
  try{
    const ver = localStorage.getItem(VER_KEY);
    let list = JSON.parse(localStorage.getItem(KEY) || '[]');
    const have = new Set(list.map(a=>a.id));
    DEFAULTS.forEach(d=>{ if(!have.has(d.id)) list.push(d); });
    localStorage.setItem(KEY, JSON.stringify(list));
    localStorage.setItem(VER_KEY, VERSION);
  }catch(_){ }
}

export function getAchievements(){
  try{ return JSON.parse(localStorage.getItem(KEY) || '[]'); }catch(_){ return []; }
}

export function saveAchievements(list){
  try{
    localStorage.setItem(KEY, JSON.stringify(list));
    notifyUpdate({ type:'save' });
  }catch(_){ }
}

export function unlockAchievement(id){
  const list = getAchievements();
  const a = list.find(x=>x.id===id);
  if (!a) return false;
  if (a.unlocked) return false;
  a.unlocked = true;
  a.dateUnlocked = new Date().toISOString();
  saveAchievements(list);
  showToast(a);
  notifyUpdate({ type:'unlock', id });
  return true;
}

export function resetAchievements(){
  try{ localStorage.removeItem(KEY); initAchievements(); notifyUpdate({ type:'reset' }); }catch(_){ }
}

function ensureToastHost(){
  let host = document.getElementById('achv-toasts');
  if (!host){ host = document.createElement('div'); host.id='achv-toasts'; host.className='achv-toasts'; document.body.appendChild(host); }
  return host;
}

function chime(){
  try{
    const ctx = new (window.AudioContext||window.webkitAudioContext)();
    const o = ctx.createOscillator(); const g = ctx.createGain();
    o.type='sine'; o.frequency.setValueAtTime(880, ctx.currentTime);
    o.frequency.exponentialRampToValueAtTime(1320, ctx.currentTime+0.15);
    g.gain.setValueAtTime(0.08, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime+0.2);
    o.connect(g).connect(ctx.destination); o.start(); o.stop(ctx.currentTime+0.22);
  }catch(_){ }
}

export function showToast(ach){
  const host = ensureToastHost();
  const item = document.createElement('div');
  item.className = 'achv-toast';
  item.innerHTML = `
    <div class="achv-head">achievement unlocked</div>
    <div class="achv-name">${ach.name}</div>
    <div class="achv-desc">${ach.description}</div>
  `;
  host.appendChild(item);
  requestAnimationFrame(()=> item.classList.add('show'));
  chime();
  setTimeout(()=>{ item.classList.remove('show'); setTimeout(()=> item.remove(), 300); }, 2600);
}

initAchievements();

let bc = null;
try { bc = new BroadcastChannel('achievements'); } catch(_) { bc = null; }
function notifyUpdate(payload){
  try{ if (bc) bc.postMessage(payload); }catch(_){ }
  try{ window.dispatchEvent(new CustomEvent('achievements:updated', { detail: payload })); }catch(_){ }
}
