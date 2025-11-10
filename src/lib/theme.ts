const STORAGE_KEY = 'maro_theme_cli';

export const THEMES = ['classic','neon','void','retro','solarized','glass','carbon','light'] as const;
export type ThemeName = (typeof THEMES)[number];
const THEME_CLASS_LIST = THEMES.map((name) => `theme-${name}`);

function getDocElements() {
  if (typeof document === 'undefined') {
    return null;
  }
  return { root: document.documentElement, body: document.body };
}

export function applyThemeClasses(theme: ThemeName) {
  const els = getDocElements();
  if (!els) return;
  els.root.classList.remove(...THEME_CLASS_LIST);
  els.body.classList.remove(...THEME_CLASS_LIST);
  if (theme !== 'classic') {
    const cls = `theme-${theme}`;
    els.root.classList.add(cls);
    els.body.classList.add(cls);
  }
}

export function readStoredTheme(): ThemeName {
  if (typeof window === 'undefined') {
    return 'classic';
  }
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved && (THEMES as readonly string[]).includes(saved)) {
      return saved as ThemeName;
    }
  } catch (error) {
    console.warn('[theme] Unable to read stored theme', error);
  }
  return 'classic';
}

export function persistTheme(theme: ThemeName) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, theme);
  } catch (error) {
    console.warn('[theme] Unable to persist theme', error);
  }
}

export function dispatchThemeChange(theme: ThemeName) {
  if (typeof window === 'undefined') return;
  try {
    window.dispatchEvent(new CustomEvent('theme:changed', { detail: { name: theme } }));
  } catch {
    /* noop */
  }
}

export function setTheme(theme: ThemeName) {
  applyThemeClasses(theme);
  persistTheme(theme);
  dispatchThemeChange(theme);
}

export function syncInitialTheme() {
  const theme = readStoredTheme();
  applyThemeClasses(theme);
  return theme;
}

export function listenForExternalThemeChanges(callback: (theme: ThemeName) => void) {
  if (typeof window === 'undefined') return () => {};
  const onThemeChanged = (event: Event) => {
    const detail = (event as CustomEvent<{ name?: string }>).detail;
    const next = detail?.name;
    if (next && (THEMES as readonly string[]).includes(next)) {
      callback(next as ThemeName);
    }
  };
  const onStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY && event.newValue && (THEMES as readonly string[]).includes(event.newValue)) {
      callback(event.newValue as ThemeName);
    }
  };
  window.addEventListener('theme:changed', onThemeChanged);
  window.addEventListener('storage', onStorage);
  return () => {
    window.removeEventListener('theme:changed', onThemeChanged);
    window.removeEventListener('storage', onStorage);
  };
}
