import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import SiteFooter from '../components/SiteFooter';

const GAME_LINKS = [
  'snake',
  'flappy',
  'pong',
  'tetris',
  'breakout',
  'dodge',
  'memory',
  'runner',
  'shooter',
];

export default function GamesPage() {
  const location = useLocation();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    document.title = 'Games - Maro';
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('show') === '1') {
      setVisible(true);
    }
  }, [location.search]);

  useEffect(() => {
    const reveal = () => setVisible(true);
    window.addEventListener('games:reveal', reveal as EventListener);
    return () => window.removeEventListener('games:reveal', reveal as EventListener);
  }, []);

  const listStyle = useMemo(() => ({ display: visible ? 'block' : 'none', textAlign: 'left' as const }), [visible]);

  return (
    <main className="page">
      <div className="container" style={{ alignItems: 'stretch', maxWidth: 820 }}>
        <h1 className="name">
          <span className="gradient-text">Games</span>
        </h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>
          Geheimmenue: Alt + G druecken oder{' '}
          <button
            type="button"
            onClick={() => setVisible(true)}
            style={{
              background: 'transparent',
              color: 'var(--accent-2)',
              border: 'none',
              textDecoration: 'underline',
              cursor: 'pointer',
              font: 'inherit',
            }}
          >
            jetzt anzeigen
          </button>
        </p>
        <section id="games-list" className="card" style={listStyle}>
          <ul
            style={{
              listStyle: 'none',
              paddingLeft: 0,
              margin: 0,
              display: 'grid',
              gap: 10,
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            }}
          >
            {GAME_LINKS.map((name) => (
              <li key={name}>
                <a className="link" href={`/games/${name}.html`} target="_blank" rel="noopener noreferrer">
                  {name.charAt(0).toUpperCase() + name.slice(1)}
                </a>
              </li>
            ))}
          </ul>
        </section>
        <Link to="/" className="link" style={{ justifyContent: 'center' }}>
          Zurueck zur Startseite
        </Link>
        <SiteFooter />
      </div>
    </main>
  );
}
