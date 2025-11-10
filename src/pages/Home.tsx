import { useEffect } from 'react';
import SocialLinks from '../components/SocialLinks';
import SiteFooter from '../components/SiteFooter';

export default function HomePage() {
  useEffect(() => {
    document.title = 'Maro - Home';
  }, []);

  return (
    <main className="page">
      <div className="container">
        <h1 className="name">
          <span className="gradient-text">Maro</span>
        </h1>
        <SocialLinks />
        <SiteFooter />
      </div>
    </main>
  );
}
