import { useEffect, useMemo } from 'react';
import SiteFooter from '../components/SiteFooter';

export default function ImpressumPage() {
  const updatedDate = useMemo(() => new Date().toISOString().slice(0, 10), []);

  useEffect(() => {
    document.title = 'Impressum — Maro';
  }, []);

  return (
    <main className="page">
      <div className="container" style={{ alignItems: 'stretch', maxWidth: 800 }}>
        <h1 className="name" style={{ marginBottom: '0.5rem' }}>
          <span className="gradient-text">Impressum</span>
        </h1>
        <section className="card" style={{ textAlign: 'left', lineHeight: 1.7 }}>
          <h2 style={{ margin: '0 0 .5rem 0', fontSize: '1.1rem' }}>Angaben gemäß § 5 TMG</h2>
          <p>
            E-Mail:{' '}
            <a href="mailto:mail@mgoth.de" rel="noopener noreferrer">
              mail@mgoth.de
            </a>
          </p>

          <h3 style={{ margin: '1rem 0 .4rem 0', fontSize: '1rem' }}>Vertreten durch</h3>
          <p>Maro Elias Goth (private Website, keine kommerzielle Nutzung)</p>

          <h3 style={{ margin: '1rem 0 .4rem 0', fontSize: '1rem' }}>Kontakt</h3>
          <p>
            E‑Mail:{' '}
            <a href="mailto:mail@mgoth.de" rel="noopener noreferrer">
              mail@mgoth.de
            </a>
          </p>

          <h3 style={{ margin: '1rem 0 .4rem 0', fontSize: '1rem' }}>Haftung für Inhalte</h3>
          <p>
            Als Diensteanbieter bin ich gemäß § 7 Abs.1 TMG für eigene Inhalte auf diesen Seiten nach den allgemeinen
            Gesetzen verantwortlich. Nach §§ 8 bis 10 TMG bin ich jedoch nicht verpflichtet, übermittelte oder
            gespeicherte fremde Informationen zu überwachen oder nach Umständen zu forschen, die auf eine rechtswidrige
            Tätigkeit hinweisen.
          </p>

          <h3 style={{ margin: '1rem 0 .4rem 0', fontSize: '1rem' }}>Haftung für Links</h3>
          <p>
            Diese Seite enthält Links zu externen Websites Dritter, auf deren Inhalte ich keinen Einfluss habe. Für die
            Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter oder Betreiber der Seiten verantwortlich.
          </p>

          <h3 style={{ margin: '1rem 0 .4rem 0', fontSize: '1rem' }}>Urheberrecht</h3>
          <p>
            Die durch den Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen dem Urheberrecht.
            Beiträge Dritter sind als solche gekennzeichnet.
          </p>

          <p className="muted" style={{ marginTop: '1rem', color: '#aee7df' }}>
            Stand: {updatedDate}
          </p>
        </section>

        <SiteFooter />
      </div>
    </main>
  );
}
