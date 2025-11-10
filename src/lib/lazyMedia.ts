let lazyInitialized = false;

export function initLazyMedia() {
  if (lazyInitialized) return;
  if (typeof window === 'undefined' || typeof document === 'undefined') return;
  lazyInitialized = true;

  const enableNativeLazy = () => {
    document.querySelectorAll('img').forEach((img) => {
      if (!img.hasAttribute('loading')) {
        img.setAttribute('loading', 'lazy');
      }
    });
  };

  enableNativeLazy();

  const canObserve = 'IntersectionObserver' in window;
  if (!canObserve) {
    document.querySelectorAll('img[data-src], video[data-src], iframe[data-src]').forEach((el) => {
      const dataSrc = el.getAttribute('data-src');
      if (dataSrc) {
        el.setAttribute('src', dataSrc);
      }
    });
    document.querySelectorAll<HTMLVideoElement>('video[data-src]').forEach((video) => {
      video.load?.();
      if (video.autoplay || video.classList.contains('bg-video')) {
        video.play?.().catch(() => undefined);
      }
    });
    return;
  }

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const el = entry.target as HTMLElement;
      if (el instanceof HTMLImageElement) {
        const dataSrc = el.dataset.src;
        if (dataSrc) el.src = dataSrc;
        obs.unobserve(el);
        return;
      }
      if (el instanceof HTMLIFrameElement) {
        const dataSrc = el.dataset.src;
        if (dataSrc) el.src = dataSrc;
        obs.unobserve(el);
        return;
      }
      if (el instanceof HTMLVideoElement) {
        const dataSrc = el.dataset.src;
        if (dataSrc) el.src = dataSrc;
        el.querySelectorAll('source[data-src]').forEach((source) => {
          const htmlSource = source as HTMLSourceElement;
          if (htmlSource.dataset.src) {
            htmlSource.src = htmlSource.dataset.src;
            htmlSource.removeAttribute('data-src');
          }
        });
        el.load?.();
        if (el.autoplay || el.classList.contains('bg-video')) {
          el.play?.().catch(() => undefined);
        }
        obs.unobserve(el);
      }
    });
  }, { rootMargin: '200px 0px', threshold: 0.01 });

  document.querySelectorAll<HTMLImageElement>('img').forEach((img) => {
    if (!img.hasAttribute('loading')) {
      img.setAttribute('loading', 'lazy');
    }
    observer.observe(img);
  });

  document.querySelectorAll<HTMLVideoElement>('video').forEach((video) => {
    observer.observe(video);
  });

  document.querySelectorAll<HTMLIFrameElement>('iframe[data-src]').forEach((frame) => {
    if (!frame.hasAttribute('loading')) {
      frame.setAttribute('loading', 'lazy');
    }
    observer.observe(frame);
  });
}
