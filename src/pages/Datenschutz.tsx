import { useEffect, useMemo } from 'react';
import SiteFooter from '../components/SiteFooter';

export default function DatenschutzPage() {
  const updatedDate = useMemo(() => new Date().toISOString().slice(0, 10), []);

  useEffect(() => {
    document.title = 'Datenschutzerklärung — Maro';
  }, []);

  return (
    <main className="page">
      <div className="container" style={{ alignItems: 'stretch', maxWidth: 800 }}>
        <h1 className="name" style={{ marginBottom: '0.5rem' }}>
          <span className="gradient-text">Datenschutzerklärung</span>
        </h1>
        <section className="card" style={{ textAlign: 'left', lineHeight: 1.7 }}>
          <p>
            Diese private Website verzichtet auf Tracking, externe Analyse-Tools und Cookies, die einer Einwilligung
            bedürfen. Es werden ausschließlich die technisch notwendigen Daten verarbeitet.
          </p>

          <h2 style={{ margin: '1rem 0 .4rem 0', fontSize: '1.1rem' }}>Verantwortlicher</h2>
          <p>
            Maro (privates Projekt). Kontakt:{' '}
            <a href="mailto:mail@mgoth.de" rel="noopener noreferrer">
              mail@mgoth.de
            </a>
            .
          </p>

          <h2 style={{ margin: '1rem 0 .4rem 0', fontSize: '1.1rem' }}>Server-Logs</h2>
          <p>
            Beim Aufruf der Website können durch den Hosting-Provider technisch notwendige Informationen (z. B.
            IP-Adresse, Datum/Uhrzeit, aufgerufene Datei) in Server-Logfiles gespeichert werden. Diese Daten werden
            ausschließlich zur Sicherstellung des technischen Betriebs genutzt und nicht mit anderen Datenquellen
            zusammengeführt.
          </p>

          <h2 style={{ margin: '1rem 0 .4rem 0', fontSize: '1.1rem' }}>Medien & Einbindungen</h2>
          <p>
            Lokale Medien (z. B. Audio/Video) werden direkt von dieser Seite geladen. Es werden keine externen CDNs für
            kritische Funktionen verwendet.
          </p>

          <h2 style={{ margin: '1rem 0 .4rem 0', fontSize: '1.1rem' }}>Rechtsgrundlagen</h2>
          <p>
            Die Verarbeitung erfolgt auf Grundlage berechtigter Interessen Art. 6 Abs. 1 lit. f DSGVO (Betrieb und
            Sicherheit der Website).
          </p>

          <h2 style={{ margin: '1rem 0 .4rem 0', fontSize: '1.1rem' }}>Speicherdauer</h2>
          <p>
            Server-Logs werden vom Hosting-Provider automatisch rotiert und gemäß dessen Richtlinien gelöscht. Inhalte,
            die lokal im Browser gespeichert werden (z. B. „Achievements“, Terminal-Verlauf), bleiben bis zur manuellen
            Löschung im Browser erhalten.
          </p>

          <h2 style={{ margin: '1rem 0 .4rem 0', fontSize: '1.1rem' }}>Betroffenenrechte</h2>
          <p>
            Da keine personenbezogenen Profile erstellt werden und der Auftritt rein privat ist, sind typische
            Betroffenenrechte (Auskunft, Löschung etc.) grundsätzlich gewahrt. Für Anfragen: bitte per E‑Mail an{' '}
            <a href="mailto:mail@mgoth.de" rel="noopener noreferrer">
              mail@mgoth.de
            </a>
            .
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
