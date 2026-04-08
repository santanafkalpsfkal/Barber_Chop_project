import { SERVICIOS } from '../../data/barberia';
import { SectionHeader, GoldButton, Reveal } from '../ui';
import { useCatalogStore } from '../../store/catalogStore';
import './Servicios.css';

const SERVICE_ICONS = {
  'Corte de Cabello': '✂️',
  'Arreglo de Barba': '🧔',
  'Corte + Barba': '💈',
  'Corte Premium': '👑',
  'Afeitado Clásico': '🪒',
};

export default function Servicios() {
  const services = useCatalogStore((state) => state.services);
  const serviceList = services.length > 0 ? services : SERVICIOS;

  return (
    <section id="servicios" className="servicios">
      {/* Textured background */}
      <div className="servicios__bg" />

      <div className="container">
        <SectionHeader
          tag="Lo que hacemos"
          title="Nuestros Servicios"
          subtitle="Expertos en cortes de cabello, afeitado y cuidado personal masculino. ¡Te esperamos para darte el mejor look!"
          dark
        />

        <div className="servicios__grid">
          {serviceList.map((s, i) => (
            <Reveal key={s.id} delay={i + 1} className="servicios__card-wrap">
              <div className="servicios__card">
                <div className="servicios__card-deco" />
                <div className="servicios__icon">{s.icono || SERVICE_ICONS[s.nombre] || '✂️'}</div>
                <h3 className="servicios__name">{s.nombre}</h3>
                <p className="servicios__desc">{s.descripcion}</p>
                <div className="servicios__price">
                  desde <strong>${Number(s.precio).toLocaleString('es-CO')}</strong>
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={4} className="servicios__cta">
          <GoldButton href="#reservar" size="lg">Reservar Turno Ahora</GoldButton>
        </Reveal>
      </div>
    </section>
  );
}
