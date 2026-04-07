import { BARBERIA } from '../../data/barberia';
import { SectionHeader, WAButton, Reveal } from '../ui';
import './Ubicacion.css';

export default function Ubicacion() {
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(BARBERIA.direccion)}`;

  return (
    <section className="ubicacion">
      <div className="container">
        <SectionHeader
          tag="Encuéntranos"
          title="¿Dónde Estamos?"
          subtitle="Visítanos en el corazón de Bogotá. ¡Te esperamos!"
        />

        <div className="ubicacion__grid">
          <Reveal delay={1} className="ubicacion__info-wrap">
            <div className="ubicacion__info">
              <div className="ubicacion__detail">
                <div className="ubicacion__detail-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
                    <circle cx="12" cy="10" r="3"/>
                  </svg>
                </div>
                <div>
                  <span className="ubicacion__detail-label">Dirección</span>
                  <span className="ubicacion__detail-val">{BARBERIA.direccion}</span>
                </div>
              </div>

              <div className="ubicacion__detail">
                <div className="ubicacion__detail-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/>
                    <polyline points="12 6 12 12 16 14"/>
                  </svg>
                </div>
                <div>
                  <span className="ubicacion__detail-label">Horario</span>
                  <span className="ubicacion__detail-val">{BARBERIA.horario}</span>
                </div>
              </div>

              <div className="ubicacion__detail">
                <div className="ubicacion__detail-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.5 19.79 19.79 0 01.17 5.82 2 2 0 012.16 3.62h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 11.1a16 16 0 006 6l1.37-1.37a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/>
                  </svg>
                </div>
                <div>
                  <span className="ubicacion__detail-label">Teléfono</span>
                  <span className="ubicacion__detail-val">{BARBERIA.telefono}</span>
                </div>
              </div>

              <div className="ubicacion__actions">
                <WAButton phone={BARBERIA.whatsapp} text="Escribir por WhatsApp" full />
                <a href={mapsUrl} target="_blank" rel="noreferrer" className="ubicacion__maps-btn">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 11l19-9-9 19-2-8-8-2z"/>
                  </svg>
                  Cómo llegar
                </a>
              </div>
            </div>
          </Reveal>

          <Reveal delay={2} className="ubicacion__map-wrap">
            <div className="ubicacion__map">
              <iframe
                title="Ubicación BarberKing"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3976.8!2d-74.0721!3d4.7110!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNMKwNDInMzkuNiJOIDc0wrAwNCczNS42Ilc!5e0!3m2!1ses!2sco!4v1"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
