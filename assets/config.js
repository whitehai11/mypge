// Global configuration for optional features
export const config = {
  // Enable Steam widget (requires backend /steam.json to be available)
  steam: {
    enabled: true,
    pollMs: 5 * 60 * 1000 // 5 minutes
  },

  // Enable neon cursor tail effect
  cursor: {
    enabled: true,
    color: '#00FFC8',
    maxParticles: 24,
    lifespanMs: 320,
    size: 10,
  },

  // Secret/Easter Egg settings (client-side only for fun)
  // IMPORTANT: Real secrets must be verified server-side.
  secret: {
    // SHA-256 hex of the password (lowercase). Example is hash of 'maro'.
    SECRET_HASH: 'fe10d0a16e930c3cbfc12d7eceb80f16d27cfb6806c0d37e0d478657401a89a2',
    // Almost-leak hint: make guessing easy but fun.
    SECRET_HINT: "hint: it's basically 'ma' + 'ro'",
    ENABLE_MOBILE_EASTER: false,
    ENABLE_SFX: true,
    PERSIST_THEMES: true,
    SHOW_HIDDEN_LINKS: false
  }
};
