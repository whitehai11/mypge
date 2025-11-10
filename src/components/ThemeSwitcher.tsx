import { useEffect, useRef, useState } from 'react';
import { ThemeName } from '../lib/theme';
import { useTheme } from '../hooks/useTheme';

export function ThemeSwitcher() {
  const { theme, setTheme, themes } = useTheme();
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const handleClick = (event: MouseEvent) => {
      if (!wrapperRef.current) return;
      if (!wrapperRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    };
    document.addEventListener('click', handleClick);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('click', handleClick);
      document.removeEventListener('keydown', handleKey);
    };
  }, [open]);

  const handleSelect = (name: ThemeName) => {
    setTheme(name);
    setOpen(false);
  };

  return (
    <div className="theme-switch" aria-label="Theme Auswahl" ref={wrapperRef}>
      <button
        id="theme-toggle"
        className="theme-btn"
        aria-haspopup="true"
        aria-expanded={open}
        title="Theme wechseln"
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          setOpen((prev) => !prev);
        }}
      >
        <span className="dot" />
        <span id="theme-label">Theme: {theme}</span>
        <svg className="chev" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M7 10l5 5 5-5z" />
        </svg>
      </button>
      <div
        id="theme-menu"
        className={`theme-menu${open ? ' open' : ''}`}
        role="menu"
        aria-hidden={!open}
      >
        {themes.map((name) => (
          <button
            key={name}
            data-theme={name}
            role="menuitem"
            type="button"
            onClick={() => handleSelect(name)}
          >
            {name.charAt(0).toUpperCase() + name.slice(1)}
          </button>
        ))}
      </div>
    </div>
  );
}

export default ThemeSwitcher;
