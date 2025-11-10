import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import SiteFooter from '../components/SiteFooter';
import { Achievement, getAchievements, resetAchievements } from '../lib/achievements';

type FilterValue = 'all' | 'unlocked' | 'locked' | 'Easter Eggs' | 'System' | 'Media' | 'Fun';

const FILTERS: ReadonlyArray<{ value: FilterValue; label: string }> = [
  { value: 'all', label: 'All' },
  { value: 'unlocked', label: 'Unlocked' },
  { value: 'locked', label: 'Locked' },
  { value: 'Easter Eggs', label: 'Easter Eggs' },
  { value: 'System', label: 'System' },
  { value: 'Media', label: 'Media' },
  { value: 'Fun', label: 'Fun' },
];

export default function AchievementsPage() {
  const [filter, setFilter] = useState<FilterValue>('all');
  const [list, setList] = useState<Achievement[]>(() => getAchievements());

  const refresh = useCallback(() => {
    setList(getAchievements());
  }, []);

  useEffect(() => {
    document.title = 'Achievements - Maro';
  }, []);

  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key === 'achievements') {
        refresh();
      }
    };
    const onCustom = () => refresh();

    window.addEventListener('storage', onStorage);
    window.addEventListener('achievements:updated', onCustom as EventListener);

    let channel: BroadcastChannel | null = null;
    try {
      channel = new BroadcastChannel('achievements');
      channel.onmessage = refresh;
    } catch {
      channel = null;
    }

    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('achievements:updated', onCustom as EventListener);
      channel?.close();
    };
  }, [refresh]);

  const filtered = useMemo(() => {
    return list.filter((item) => {
      if (filter === 'all') return true;
      if (filter === 'unlocked') return item.unlocked;
      if (filter === 'locked') return !item.unlocked;
      return item.category === filter;
    });
  }, [filter, list]);

  const handleReset = () => {
    if (window.confirm('Alle Achievements wirklich zuruecksetzen?')) {
      resetAchievements();
      refresh();
    }
  };

  return (
    <main className="page">
      <div className="container" style={{ alignItems: 'stretch', maxWidth: 960 }}>
        <h1 className="name" style={{ marginBottom: '0.5rem' }}>
          <span className="gradient-text">Achievements</span>
        </h1>
        <div className="card" style={{ width: '100%' }}>
          <div className="achv-controls">
            <select value={filter} onChange={(event) => setFilter(event.target.value as FilterValue)}>
              {FILTERS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={handleReset}
              style={{
                borderRadius: 10,
                border: '1px solid var(--border)',
                background: 'transparent',
                color: 'inherit',
                padding: '0.5rem 0.9rem',
                cursor: 'pointer',
              }}
            >
              Reset Progress
            </button>
            <Link className="link" style={{ justifyContent: 'center' }} to="/">
              Zurueck
            </Link>
          </div>
          <section id="grid" className="achievements-grid">
            {filtered.map((item) => (
              <article key={item.id} className={`achievement ${item.unlocked ? 'unlocked' : 'locked'}`}>
                {item.icon ? <img src={item.icon} loading="lazy" alt="" /> : null}
                <h3>{item.name}</h3>
                <p>{item.unlocked ? item.description : '???'}</p>
                {item.unlocked && item.dateUnlocked ? (
                  <span>Unlocked: {item.dateUnlocked.slice(0, 10)}</span>
                ) : null}
              </article>
            ))}
          </section>
        </div>
        <SiteFooter />
      </div>
    </main>
  );
}
