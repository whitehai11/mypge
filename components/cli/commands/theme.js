export async function run(input, ctx) {
  const name = (input.split(/\s+/)[1]||'').toLowerCase();
  const allowed = ['neon','void','classic'];
  if (!allowed.includes(name)) {
    await ctx.typeLines([`usage: theme <${allowed.join('|')}>`], 24);
    return;
  }
  document.documentElement.classList.remove('theme-neon','theme-void','theme-classic');
  document.documentElement.classList.add('theme-'+name);
  try { localStorage.setItem('maro_theme_cli', name); } catch(_){ }
  await ctx.typeLines([`[theme] switched to ${name}`], 24);
}

