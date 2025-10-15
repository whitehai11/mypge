Maro Personal Homepage

Overview
- Static, fast personal site (guns.lol style) with a glass UI.
- Optional Terminal Overlay with commands, themes, mini‑apps, and Easter Eggs.
- Achievements with local storage and live notifications; overview page included.
- Hidden Dev Overlay for power users (performance and config info).

Getting Started
- No build needed. Open `index.html` in a browser or deploy to Vercel/Netlify.
- All code is plain HTML/CSS/JS; no external libraries.

Keyboard Shortcuts
- Ctrl + `  → toggle Terminal overlay
- Ctrl + D  → toggle Dev Overlay (console/config/system)
- Ctrl + C  → interrupt running terminal tasks (matrix, tv, music, chat)
- Esc       → close overlays; exit Matrix mode

Terminal Commands (high level)
- `help` — list commands (includes dynamic modules)
- `about`, `socials`, `contact`, `clear`, `exit`
- `sudo secret` — open the Secret Vault (Easter Egg menu)
- `matrix` — green rain effect (Esc to exit)
- `play lo-fi` — start Lo‑Fi loop; `pause`/`resume` to control
- `tv` — 10s ASCII video render
- `chat` — minimal local chat; `exit chat` to leave
- `mood` — random system mood line
- `timewarp` — glitch + jump 50 years
- `trace gothlab.dev` — fake route trace
- `theme <name>` — switch styles (neon|void|retro|solarized|glass|carbon|light|classic)
- `reboot` — fake boot splash
- `rm -rf /` — self‑destruct then reboot

Themes
- Styles live in `styles/themes.css`. Switch by:
  - Dropdown (top‑right) or
  - Terminal: `theme neon` (etc.)
- Persisted in `localStorage.maro_theme_cli`.
- Themes included: neon, void, retro, solarized, glass, carbon, light (minimal), classic.

Lazy Loading
- `assets/lazy.js` implements native + IntersectionObserver lazy loading for images, videos and iframes.
- Background video uses `data-src` and is loaded when in view.

Achievements
- Module: `components/achievements.js`
- Storage: `localStorage.achievements` (+ `achievements_version`).
- Default set: matrix_mode, vault_access, meltdown, theme_switch, chat_used, tv_watched.
- API:
  - `unlockAchievement(id)` — marks unlocked, stores timestamp, shows toast
  - `resetAchievements()` — resets and re‑initializes defaults
  - `getAchievements()` — returns array
- Notifications: neon glass toast (bottom‑right) + optional chime.
- Live updates: BroadcastChannel (`achievements`) + `achievements:updated` event.
- Overview pages: `achievements.html` (root) and `pages/achievements.html` (same UI).

Dev Overlay
- File: `components/devOverlay.js`
- Toggle with Ctrl + D. Tabs:
  - console — recent terminal commands
  - config — quick theme switch, test unlock
  - system — theme, unlocked count, localStorage size, build version, uptime, FPS

Music Player
- Appears automatically when running `play lo-fi`.
- Controls: Play/Pause, Volume slider, Close. Pauses on Ctrl + C.

Pages
- `impressum.html`, `datenschutz.html`, `achievements.html`, `404.html`.

Config
- `assets/config.js` contains toggles (cursor effect) and Secret Vault options.
- `secret.SECRET_HASH` remains for client‑side Easter Eggs (see note below).

Easter Egg Security Note
- The Secret Vault and any “sudo” checks are client‑side only for fun.
- IMPORTANT: Real secrets or privileged actions must be validated server‑side. Client‑side checks can be bypassed.

Performance Notes
- Largest Contentful Paint targeted < 1.5s by deferring offscreen media.
- Total Blocking Time targeted < 150ms (no heavy JS at startup, dynamic imports on demand).
