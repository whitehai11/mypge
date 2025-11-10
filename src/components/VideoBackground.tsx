import { useEffect, useRef } from 'react';

type VideoBackgroundProps = {
  src: string;
};

export function VideoBackground({ src }: VideoBackgroundProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const loadVideo = async () => {
      if (!video.dataset.src) return;
      if (video.src === video.dataset.src) return;
      video.src = video.dataset.src;
      try {
        video.load();
        if (video.autoplay || video.classList.contains('bg-video')) {
          await video.play();
        }
      } catch {
        // ignore autoplay failures
      }
    };

    if (!('IntersectionObserver' in window)) {
      loadVideo();
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        loadVideo();
        observer.disconnect();
      });
    }, { rootMargin: '200px 0px', threshold: 0.02 });

    observer.observe(video);
    return () => observer.disconnect();
  }, [src]);

  return (
    <div className="video-bg" aria-hidden="true">
      <video
        ref={videoRef}
        className="bg-video"
        muted
        loop
        playsInline
        preload="none"
        data-src={src}
      />
      <div className="video-scrim" />
    </div>
  );
}

export default VideoBackground;