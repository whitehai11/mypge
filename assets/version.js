export const VERSION = '1.2.0';

(() => {
  const badge = document.createElement('div');
  badge.className = 'version-badge';
  badge.textContent = `v${VERSION}`;
  document.addEventListener('DOMContentLoaded', () => {
    document.body.appendChild(badge);
  });
})();

