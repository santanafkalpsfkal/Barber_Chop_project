import { Reveal } from '../ui';
import './Stats.css';

const STATS = [
  { valor: '10+', label: 'Años de experiencia' },
  { valor: '5K+', label: 'Clientes satisfechos' },
  { valor: '3',   label: 'Barberos profesionales' },
  { valor: '98%', label: 'Satisfacción garantizada' },
];

export default function Stats() {
  return (
    <div className="stats">
      <div className="container stats__grid">
        {STATS.map((s, i) => (
          <Reveal key={i} delay={i + 1}>
            <div className="stats__item">
              <span className="stats__valor">{s.valor}</span>
              <span className="stats__label">{s.label}</span>
            </div>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
