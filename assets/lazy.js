// Implements native + observer-based lazy loading for media elements

// 1) Native lazy for images where supported
(() => {
  if ('loading' in HTMLImageElement.prototype) {
    document.querySelectorAll('img').forEach(img => {
      if (!img.hasAttribute('loading')) img.setAttribute('loading', 'lazy');
    });
  }
})();

// 2) IntersectionObserver fallback and lazy for videos/iframes
(() => {
  const canObserve = 'IntersectionObserver' in window;
  if (!canObserve) {
    // Fallback: eagerly set src for data-src elements to avoid broken media
    document.querySelectorAll('img[data-src], video[data-src], iframe[data-src]').forEach(el => {
      el.setAttribute('src', el.getAttribute('data-src'));
    });
    // Attempt to load and play background videos if any
    document.querySelectorAll('video[data-src]').forEach(v => { try { v.load?.(); v.play?.(); } catch(_){} });
    return;
  }

  const obs = new IntersectionObserver((entries, o) => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el = e.target;
      // Images: prefer data-src if present
      if (el.tagName === 'IMG') {
        const ds = el.getAttribute('data-src');
        if (ds) el.src = ds;
        o.unobserve(el);
        return;
      }

      // Iframes
      if (el.tagName === 'IFRAME') {
        const ds = el.getAttribute('data-src');
        if (ds) el.src = ds;
        o.unobserve(el);
        return;
      }

      // Videos: support data-src either on <video> or its <source>
      if (el.tagName === 'VIDEO') {
        const ds = el.getAttribute('data-src');
        if (ds) el.src = ds;
        // If there are <source data-src>, map them to src
        el.querySelectorAll('source[data-src]').forEach(s => { s.src = s.dataset.src; s.removeAttribute('data-src'); });
        try { el.load(); } catch(_){}
        // Autoplay if attribute present
        if (el.hasAttribute('autoplay') || el.classList.contains('bg-video')) {
          el.play?.().catch(()=>{});
        }
        o.unobserve(el);
        return;
      }
    });
  }, { rootMargin: '200px 0px', threshold: 0.01 });

  // Observe images that either have data-src or simply to ensure they get loaded on view
  document.querySelectorAll('img').forEach(img => {
    // Native lazy hint
    if (!img.hasAttribute('loading')) img.setAttribute('loading', 'lazy');
    obs.observe(img);
  });

  // Observe videos with potential data-src (e.g., background video)
  document.querySelectorAll('video, video source[data-src]').forEach(node => {
    const vid = node.tagName === 'VIDEO' ? node : node.closest('video');
    if (vid) obs.observe(vid);
  });

  // Observe iframes using data-src
  document.querySelectorAll('iframe[data-src]').forEach(f => {
    if (!f.hasAttribute('loading')) f.setAttribute('loading', 'lazy');
    obs.observe(f);
  });
})();

