Maro Personal Homepage

Overview
- Static personal site (guns.lol-style) with a glass UI and optional overlay terminal.
- Terminal supports commands: help, about, socials, contact, clear, exit, and an Easter-egg ‘sudo secret’ flow.

Easter Egg Security Note
- The ‘sudo secret’ command uses a client-side SHA-256 comparison purely for fun.
- IMPORTANT: For real secrets or privileged actions, always verify server-side. Client-side checks can be bypassed and must not protect sensitive data.

Config
- assets/config.js contains toggles and settings.
- secret.SECRET_HASH should be the lowercase hex SHA-256 of your chosen password.

Keyboard Shortcuts
- Ctrl + ` toggles the terminal overlay.

