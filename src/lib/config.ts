export const config = {
  steam: {
    enabled: true,
    pollMs: 5 * 60 * 1000,
  },
  cursor: {
    enabled: true,
    color: '#00FFC8',
    maxParticles: 24,
    lifespanMs: 320,
    size: 10,
  },
  secret: {
    SECRET_HASH: 'fe10d0a16e930c3cbfc12d7eceb80f16d27cfb6806c0d37e0d478657401a89a2',
    SECRET_HINT: "hint: it's basically 'ma' + 'ro'",
    ENABLE_MOBILE_EASTER: false,
    ENABLE_SFX: true,
    PERSIST_THEMES: true,
    SHOW_HIDDEN_LINKS: false,
  },
} as const;

export type AppConfig = typeof config;