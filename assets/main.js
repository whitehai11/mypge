import { initCursorEffect } from './cursor.js';

// Apply stored theme early
try {
  const saved = localStorage.getItem('maro_theme_cli');
  const clsList = ['theme-neon','theme-void','theme-retro','theme-solarized','theme-glass','theme-carbon','theme-light','theme-classic'];
  if (saved && saved !== 'classic') {
    document.documentElement.classList.remove(...clsList);
    document.body.classList.remove(...clsList);
    const cls = 'theme-'+saved;
    document.documentElement.classList.add(cls);
    document.body.classList.add(cls);
  }
} catch(_){}

// Initialize neon cursor
initCursorEffect();

// Theme dropdown logic
(function(){
  const btn = document.getElementById('theme-toggle');
  const menu = document.getElementById('theme-menu');
  const label = document.getElementById('theme-label');
  if (!btn || !menu) return;
  const themes = ['classic','neon','void','retro','solarized','glass','carbon','light'];

  function setTheme(name){
    const clsList = ['theme-neon','theme-void','theme-retro','theme-solarized','theme-glass','theme-carbon','theme-light','theme-classic'];
    document.documentElement.classList.remove(...clsList);
    document.body.classList.remove(...clsList);
    if (name && name !== 'classic'){
      const cls = 'theme-'+name;
      document.documentElement.classList.add(cls);
      document.body.classList.add(cls);
    }
    try { localStorage.setItem('maro_theme_cli', name); } catch(_){ }
    label.textContent = `Theme: ${name}`;
  }

  // Initialize label from storage
  try { const s = localStorage.getItem('maro_theme_cli') || 'classic'; label.textContent = `Theme: ${s}`; } catch(_){ }

  function open(){ menu.classList.add('open'); btn.setAttribute('aria-expanded','true'); document.addEventListener('click', onDocClick); document.addEventListener('keydown', onKey); }
  function close(){ menu.classList.remove('open'); btn.setAttribute('aria-expanded','false'); document.removeEventListener('click', onDocClick); document.removeEventListener('keydown', onKey); }
  function onDocClick(e){ if (!menu.contains(e.target) && e.target!==btn) close(); }
  function onKey(e){ if (e.key==='Escape') close(); }

  btn.addEventListener('click', (e)=>{ e.stopPropagation(); menu.classList.contains('open') ? close() : open(); });
  menu.querySelectorAll('button[data-theme]').forEach(b=>{
    b.addEventListener('click', ()=>{ const t=b.dataset.theme; if (t && themes.includes(t)) { setTheme(t); close(); } });
  });
})();
