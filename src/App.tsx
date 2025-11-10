import { useEffect } from 'react';
import { Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import ThemeSwitcher from './components/ThemeSwitcher';
import VideoBackground from './components/VideoBackground';
import { initCursorEffect } from './lib/cursor';
import { initAchievements } from './lib/achievements';
import { initTerminal } from './lib/terminal';
import { initDevOverlay } from './lib/devOverlay';
import { mountVersionBadge } from './lib/versionBadge';
import { initLazyMedia } from './lib/lazyMedia';
import HomePage from './pages/Home';
import DatenschutzPage from './pages/Datenschutz';
import ImpressumPage from './pages/Impressum';
import AchievementsPage from './pages/Achievements';
import GamesPage from './pages/Games';
import NotFoundPage from './pages/NotFound';

const VIDEO_SRC = '/media/4216715-uhd_3840_2160_25fps.mp4';

export default function App() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    initCursorEffect();
    initAchievements();
    initTerminal();
    initDevOverlay();
    initLazyMedia();
    mountVersionBadge();
  }, []);

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (!event.altKey) return;
      if (String(event.key).toLowerCase() !== 'g') return;
      event.preventDefault();
      if (location.pathname.startsWith('/games')) {
        try {
          window.dispatchEvent(new CustomEvent('games:reveal'));
        } catch {
          // noop
        }
      } else {
        navigate('/games?show=1');
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [location.pathname, navigate]);

  return (
    <>
      <ThemeSwitcher />
      <VideoBackground src={VIDEO_SRC} />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/datenschutz" element={<DatenschutzPage />} />
        <Route path="/impressum" element={<ImpressumPage />} />
        <Route path="/achievements" element={<AchievementsPage />} />
        <Route path="/games" element={<GamesPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </>
  );
}
