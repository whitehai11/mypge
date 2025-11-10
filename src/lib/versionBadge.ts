export const VERSION = '1.2.0';
let badgeMounted = false;

export function mountVersionBadge() {
  if (badgeMounted) return;
  if (typeof document === 'undefined') return;
  badgeMounted = true;

  const badge = document.createElement('div');
  badge.className = 'version-badge';
  badge.textContent = 'v' + VERSION;

  const attach = () => {
    document.body.appendChild(badge);
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', attach, { once: true });
  } else {
    attach();
  }
}
