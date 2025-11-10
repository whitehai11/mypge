import { Link } from 'react-router-dom';

export default function SiteFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="footer">
      <p>
        &copy; {year} Maro · <Link to="/impressum">Impressum</Link> · <Link to="/datenschutz">Datenschutz</Link> ·{' '}
        <Link to="/achievements">Achievements</Link>
      </p>
    </footer>
  );
}
