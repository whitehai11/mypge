 
(() => {
  if ('loading' in HTMLImageElement.prototype) {
    document.querySelectorAll('img').forEach(img => {
      if (!img.hasAttribute('loading')) img.setAttribute('loading', 'lazy');
    });
  }
})();

 
(() => {
  const canObserve = 'IntersectionObserver' in window;
  if (!canObserve) {
    
    document.querySelectorAll('img[data-src], video[data-src], iframe[data-src]').forEach(el => {
      el.setAttribute('src', el.getAttribute('data-src'));
    });
    
    document.querySelectorAll('video[data-src]').forEach(v => { try { v.load?.(); v.play?.(); } catch(_){} });
    return;
  }

  const obs = new IntersectionObserver((entries, o) => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el = e.target;
      
      if (el.tagName === 'IMG') {
        const ds = el.getAttribute('data-src');
        if (ds) el.src = ds;
        o.unobserve(el);
        return;
      }

      
      if (el.tagName === 'IFRAME') {
        const ds = el.getAttribute('data-src');
        if (ds) el.src = ds;
        o.unobserve(el);
        return;
      }

      
      if (el.tagName === 'VIDEO') {
        const ds = el.getAttribute('data-src');
        if (ds) el.src = ds;
        
        el.querySelectorAll('source[data-src]').forEach(s => { s.src = s.dataset.src; s.removeAttribute('data-src'); });
        try { el.load(); } catch(_){}
        
        if (el.hasAttribute('autoplay') || el.classList.contains('bg-video')) {
          el.play?.().catch(()=>{});
        }
        o.unobserve(el);
        return;
      }
    });
  }, { rootMargin: '200px 0px', threshold: 0.01 });

  
  document.querySelectorAll('img').forEach(img => {
    if (!img.hasAttribute('loading')) img.setAttribute('loading', 'lazy');
    obs.observe(img);
  });

  
  document.querySelectorAll('video, video source[data-src]').forEach(node => {
    const vid = node.tagName === 'VIDEO' ? node : node.closest('video');
    if (vid) obs.observe(vid);
  });

  
  document.querySelectorAll('iframe[data-src]').forEach(f => {
    if (!f.hasAttribute('loading')) f.setAttribute('loading', 'lazy');
    obs.observe(f);
  });
})();
