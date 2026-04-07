import { useState } from 'react';
import { GALERIA } from '../../data/barberia';
import { SectionHeader, Reveal } from '../ui';
import './Galeria.css';

export default function Galeria() {
  const [lightbox, setLightbox] = useState(null);

  return (
    <section id="galeria" className="galeria">
      <div className="container">
        <SectionHeader
          tag="Nuestro Trabajo"
          title="La Calidad que Mereces"
          subtitle="Descubre por qué nuestros clientes nos eligen. Calidad, estilo y satisfacción garantizados."
        />

        <div className="galeria__grid">
          {GALERIA.map((img, i) => (
            <Reveal key={img.id} delay={(i % 3) + 1}>
              <div
                className="galeria__item"
                onClick={() => setLightbox(img)}
                role="button"
                tabIndex={0}
                onKeyDown={e => e.key === 'Enter' && setLightbox(img)}
              >
                <img src={img.url} alt={img.alt} loading="lazy" />
                <div className="galeria__item-overlay">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="galeria__zoom">
                    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                    <line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/>
                  </svg>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div className="galeria__lightbox" onClick={() => setLightbox(null)}>
          <button className="galeria__lightbox-close">✕</button>
          <img src={lightbox.url.replace('w=600', 'w=1200')} alt={lightbox.alt} />
        </div>
      )}
    </section>
  );
}
