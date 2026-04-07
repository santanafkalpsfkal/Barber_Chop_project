import { TARIFAS, SERVICIOS, BARBEROS, HORARIOS_DISPONIBLES, BARBERIA } from '../../data/barberia';
import { SectionHeader, GoldButton, WAButton, Reveal } from '../ui';
import { useReservation } from '../../hooks';
import './TarifasReserva.css';

export default function TarifasReserva() {
  const { form, errores, enviado, handleChange, handleSubmit, resetForm } = useReservation();

  // Min date = today
  const today = new Date().toISOString().split('T')[0];

  if (enviado) {
    return (
      <section id="reservar" className="tarifas-reserva">
        <div className="container">
          <div className="reserva__success">
            <div className="reserva__success-icon">✓</div>
            <h3>¡Cita Reservada!</h3>
            <p>Nos contactaremos contigo al <strong>{form.telefono}</strong> para confirmar tu cita.</p>
            <div className="reserva__success-actions">
              <WAButton phone={BARBERIA.whatsapp} text="Confirmar por WhatsApp" />
              <button className="reserva__reset" onClick={resetForm}>Hacer otra reserva</button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="tarifas" className="tarifas-reserva">
      <div className="container">
        <div className="tarifas-reserva__grid">

          {/* ── Tarifas ── */}
          <Reveal delay={1}>
            <div className="tarifas__panel">
              <div className="tarifas__header">
                <div className="tarifas__pole tarifas__pole--left">
                  <div className="pole-stripe" /><div className="pole-stripe" /><div className="pole-stripe" />
                </div>
                <div>
                  <div className="gold-line"><span className="section-tag">Precios</span></div>
                  <h2 className="tarifas__title">Tarifas</h2>
                  <p className="tarifas__subtitle">Los mejores precios para un look impecable.</p>
                </div>
                <div className="tarifas__pole tarifas__pole--right">
                  <div className="pole-stripe" /><div className="pole-stripe" /><div className="pole-stripe" />
                </div>
              </div>

              <ul className="tarifas__list">
                {TARIFAS.map((t, i) => (
                  <li key={i} className="tarifas__row">
                    <span className="tarifas__row-name">{t.nombre}</span>
                    <span className="tarifas__row-dots" />
                    <span className="tarifas__row-price">${t.precio.toLocaleString('es-CO')}</span>
                  </li>
                ))}
              </ul>

              <div className="tarifas__cta">
                <GoldButton href="#reservar" size="md">Reservar Tu Cita →</GoldButton>
              </div>
            </div>
          </Reveal>

          {/* ── Reserva ── */}
          <Reveal delay={2}>
            <div id="reservar" className="reserva__panel">
              <SectionHeader tag="Online" title="Reserva Tu Turno" center={false} />

              <form className="reserva__form" onSubmit={handleSubmit} noValidate>
                <div className="reserva__row">
                  <div className="reserva__field">
                    <input
                      name="nombre" type="text" placeholder="Nombre completo"
                      value={form.nombre} onChange={handleChange}
                      className={errores.nombre ? 'error' : ''}
                    />
                    {errores.nombre && <span className="reserva__error">{errores.nombre}</span>}
                  </div>
                  <div className="reserva__field">
                    <input
                      name="telefono" type="tel" placeholder="Teléfono / WhatsApp"
                      value={form.telefono} onChange={handleChange}
                      className={errores.telefono ? 'error' : ''}
                    />
                    {errores.telefono && <span className="reserva__error">{errores.telefono}</span>}
                  </div>
                </div>

                <div className="reserva__field">
                  <select
                    name="servicio" value={form.servicio} onChange={handleChange}
                    className={errores.servicio ? 'error' : ''}
                  >
                    <option value="">— Elige tu servicio —</option>
                    {SERVICIOS.map(s => (
                      <option key={s.id} value={s.nombre}>{s.nombre} · ${s.precio.toLocaleString('es-CO')}</option>
                    ))}
                  </select>
                  {errores.servicio && <span className="reserva__error">{errores.servicio}</span>}
                </div>

                <div className="reserva__row">
                  <div className="reserva__field">
                    <label className="reserva__label">Fecha</label>
                    <input
                      name="fecha" type="date" min={today}
                      value={form.fecha} onChange={handleChange}
                      className={errores.fecha ? 'error' : ''}
                    />
                    {errores.fecha && <span className="reserva__error">{errores.fecha}</span>}
                  </div>

                  <div className="reserva__field">
                    <label className="reserva__label">Hora</label>
                    <select
                      name="hora" value={form.hora} onChange={handleChange}
                      className={errores.hora ? 'error' : ''}
                    >
                      <option value="">— Hora —</option>
                      {HORARIOS_DISPONIBLES.map(h => (
                        <option key={h} value={h}>{h}</option>
                      ))}
                    </select>
                    {errores.hora && <span className="reserva__error">{errores.hora}</span>}
                  </div>
                </div>

                <div className="reserva__field">
                  <select name="barbero" value={form.barbero} onChange={handleChange}>
                    <option value="">— Sin preferencia de barbero —</option>
                    {BARBEROS.map(b => (
                      <option key={b.id} value={b.nombre}>{b.nombre} · {b.especialidad}</option>
                    ))}
                  </select>
                </div>

                <div className="reserva__actions">
                  <GoldButton size="lg">Confirmar Reserva</GoldButton>
                  <WAButton phone={BARBERIA.whatsapp} />
                </div>
              </form>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
