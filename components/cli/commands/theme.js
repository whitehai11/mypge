export async function run(input, ctx) {
  const name = (input.split(/\s+/)[1]||'').toLowerCase();
  const allowed = ['neon','void','retro','solarized','glass','carbon','light','classic'];
  if (!allowed.includes(name)) {
    await ctx.typeLines([`usage: theme <${allowed.join('|')}>`], 24);
    return;
  }
  const clsList = ['theme-neon','theme-void','theme-retro','theme-solarized','theme-glass','theme-carbon','theme-light','theme-classic'];
  document.documentElement.classList.remove(...clsList);
  document.body.classList.remove(...clsList);
  const cls = 'theme-'+name;
  if (name !== 'classic') {
    document.documentElement.classList.add(cls);
    document.body.classList.add(cls);
  }
  try { localStorage.setItem('maro_theme_cli', name); } catch(_){ }
  await ctx.typeLines([`[theme] switched to ${name}`], 24);
  try { const a = await import('../../achievements.js'); a.unlockAchievement('theme_switch'); } catch(_){ }
  // Notify UI (e.g., dropdown) about theme change in this tab
  try { window.dispatchEvent(new CustomEvent('theme:changed', { detail: { name } })); } catch(_){ }
}
