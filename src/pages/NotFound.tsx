import { Link } from 'react-router-dom';
import SiteFooter from '../components/SiteFooter';

export default function NotFoundPage() {
  return (
    <main className="page">
      <div className="container" style={{ alignItems: 'center' }}>
        <h1 className="name" style={{ marginBottom: '0.5rem' }}>
          <span className="gradient-text">404</span>
        </h1>
        <p style={{ color: 'var(--text-muted)' }}>Diese Seite existiert nicht.</p>
        <Link to="/" className="link" style={{ justifyContent: 'center' }}>
          Zurück zur Startseite
        </Link>
        <SiteFooter />
      </div>
    </main>
  );
}
