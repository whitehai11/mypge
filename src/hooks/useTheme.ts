import { useCallback, useEffect, useState } from 'react';
import { listenForExternalThemeChanges, setTheme as setGlobalTheme, syncInitialTheme, THEMES, ThemeName } from '../lib/theme';

export function useTheme() {
  const [theme, setThemeState] = useState<ThemeName>(() => {
    if (typeof window === 'undefined') {
      return 'classic';
    }
    return syncInitialTheme();
  });

  const setTheme = useCallback((next: ThemeName) => {
    setThemeState(next);
    setGlobalTheme(next);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    return listenForExternalThemeChanges((next) => {
      setThemeState(next);
    });
  }, []);

  return { theme, setTheme, themes: THEMES } as const;
}