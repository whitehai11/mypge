import { config } from './config.js';

export function initCursorEffect() {
  if (!config.cursor?.enabled) return;
  const coarse = window.matchMedia('(pointer: coarse)').matches;
  if (coarse || 'ontouchstart' in window) return;

  const color = config.cursor.color || '#00FFC8';
  const maxParticles = Math.max(8, Math.min(64, config.cursor.maxParticles ?? 24));
  const lifespan = config.cursor.lifespanMs ?? 320;
  const size = config.cursor.size ?? 10;

  const canvas = document.createElement('canvas');
  canvas.className = 'cursor-canvas';
  Object.assign(canvas.style, {
    position: 'fixed',
    inset: '0',
    width: '100%',
    height: '100%',
    pointerEvents: 'none',
    zIndex: '10'
  });
  document.body.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  let dpr = window.devicePixelRatio || 1;
  function resize() {
    const { innerWidth: w, innerHeight: h } = window;
    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  resize();
  window.addEventListener('resize', resize);

  const particles = [];
  function addParticle(x, y, vx, vy) {
    particles.push({ x, y, vx, vy, t: 0 });
    if (particles.length > maxParticles) particles.shift();
  }

  let last = performance.now();
  function tick(now) {
    const dt = Math.min(32, now - last);
    last = now;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.t += dt;
      const life = Math.max(0, 1 - p.t / lifespan);
      if (life <= 0) { particles.splice(i, 1); continue; }
      p.x += p.vx * (dt / 16);
      p.y += p.vy * (dt / 16);

      const r = size * (0.6 + 0.4 * life);
      ctx.globalCompositeOperation = 'lighter';
      const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r);
      grad.addColorStop(0, color + 'cc');
      grad.addColorStop(0.6, color + '66');
      grad.addColorStop(1, '#00000000');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
      ctx.fill();
    }

    requestAnimationFrame(tick);
  }

  let px = 0, py = 0, vx = 0, vy = 0;
  function onMove(e) {
    const x = e.clientX;
    const y = e.clientY;
    vx = (x - px);
    vy = (y - py);
    px = x; py = y;
    const speed = Math.hypot(vx, vy) || 1;
    const count = Math.min(3, Math.max(1, Math.floor(speed / 12)));
    for (let i = 0; i < count; i++) {
      const f = (i + 1) / (count + 1);
      addParticle(x - vx * 0.2 * f, y - vy * 0.2 * f, -vx * 0.02, -vy * 0.02);
    }
  }

  window.addEventListener('mousemove', onMove, { passive: true });
  requestAnimationFrame(tick);

  document.documentElement.style.cursor = 'none';
}
