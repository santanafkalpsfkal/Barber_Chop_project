import { BARBEROS } from '../../data/barberia';
import { SectionHeader, Reveal } from '../ui';
import { useCatalogStore } from '../../store/catalogStore';
import './Equipo.css';

const AVATARS = [
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&q=80',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&q=80',
];

export default function Equipo() {
  const barbers = useCatalogStore((state) => state.barbers);
  const barberList = barbers.length > 0 ? barbers : BARBEROS;

  return (
    <section className="equipo">
      <div className="container">
        <SectionHeader
          tag="El equipo"
          title="Nuestros Barberos"
          subtitle="Profesionales apasionados con años de experiencia dando el mejor estilo."
        />
        <div className="equipo__grid">
          {barberList.map((b, i) => (
            <Reveal key={b.id} delay={i + 1}>
              <div className="equipo__card">
                <div className="equipo__img-wrap">
                  <img src={AVATARS[i % AVATARS.length]} alt={b.nombre} />
                  <div className="equipo__badge">Staff</div>
                </div>
                <div className="equipo__info">
                  <h3 className="equipo__nombre">{b.nombre}</h3>
                  <p className="equipo__especialidad">{b.especialidad}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
