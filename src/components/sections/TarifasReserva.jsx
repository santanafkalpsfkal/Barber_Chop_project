import { useEffect } from 'react';
import { TARIFAS, BARBERIA } from '../../data/barberia';
import { SectionHeader, GoldButton, WAButton, Reveal } from '../ui';
import { useReservationStore } from '../../store/reservationStore';
import { useCatalogStore } from '../../store/catalogStore';
import { useAuthStore } from '../../store/authStore';
import './TarifasReserva.css';

export default function TarifasReserva() {
  const user = useAuthStore((state) => state.user);
  const services = useCatalogStore((state) => state.services);
  const barbers = useCatalogStore((state) => state.barbers);
  const availability = useCatalogStore((state) => state.availability);
  const availabilityStatus = useCatalogStore((state) => state.availabilityStatus);
  const fetchAvailability = useCatalogStore((state) => state.fetchAvailability);
  const clearAvailability = useCatalogStore((state) => state.clearAvailability);

  const form = useReservationStore((state) => state.form);
  const errores = useReservationStore((state) => state.errors);
  const enviado = useReservationStore((state) => state.submitted);
  const lastReservation = useReservationStore((state) => state.lastReservation);
  const status = useReservationStore((state) => state.status);
  const requestError = useReservationStore((state) => state.error);
  const updateField = useReservationStore((state) => state.updateField);
  const submitReservation = useReservationStore((state) => state.submitReservation);
  const resetForm = useReservationStore((state) => state.resetForm);

  // Min date = today
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    fetchAvailability({ barberId: form.barberId, date: form.date, serviceId: form.serviceId });
  }, [form.barberId, form.date, form.serviceId, fetchAvailability]);

  useEffect(() => () => clearAvailability(), [clearAvailability]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    updateField(name, value);

    if (name === 'serviceId' || name === 'barberId' || name === 'date') {
      updateField('time', '');
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    await submitReservation();
  };

  if (enviado) {
    return (
      <section id="reservar" className="tarifas-reserva">
        <div className="container">
          <div className="reserva__success">
            <div className="reserva__success-icon">✓</div>
            <h3>¡Cita Reservada!</h3>
            <p>
              Tu reserva para <strong>{lastReservation?.servicio_nombre}</strong> quedó en estado
              <strong> {lastReservation?.estado}</strong>.
            </p>
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
                {requestError && <p className="reserva__request-error">{requestError}</p>}

                {!user && (
                  <div className="reserva__login-required">
                    <p>Debes iniciar sesión o crear una cuenta antes de reservar.</p>
                    <GoldButton href="#login" size="sm">Ir al acceso</GoldButton>
                  </div>
                )}

                {user && (
                  <div className="reserva__customer-card">
                    <strong>{user.fullName}</strong>
                    <span>{user.email}</span>
                    <span>{user.phone || 'Sin teléfono registrado'}</span>
                  </div>
                )}

                <div className="reserva__field">
                  <select
                    name="serviceId" value={form.serviceId} onChange={handleChange}
                    className={errores.serviceId ? 'error' : ''}
                  >
                    <option value="">— Elige tu servicio —</option>
                    {services.map((s) => (
                      <option key={s.id} value={s.id}>{s.nombre} · ${Number(s.precio).toLocaleString('es-CO')}</option>
                    ))}
                  </select>
                  {errores.serviceId && <span className="reserva__error">{errores.serviceId}</span>}
                </div>

                <div className="reserva__field">
                  <select name="barberId" value={form.barberId} onChange={handleChange} className={errores.barberId ? 'error' : ''}>
                    <option value="">— Elige tu barbero —</option>
                    {barbers.map((b) => (
                      <option key={b.id} value={b.id}>{b.nombre} · {b.especialidad}</option>
                    ))}
                  </select>
                  {errores.barberId && <span className="reserva__error">{errores.barberId}</span>}
                </div>

                <div className="reserva__row">
                  <div className="reserva__field">
                    <label className="reserva__label">Fecha</label>
                    <input
                      name="date" type="date" min={today}
                      value={form.date} onChange={handleChange}
                      className={errores.date ? 'error' : ''}
                    />
                    {errores.date && <span className="reserva__error">{errores.date}</span>}
                  </div>

                  <div className="reserva__field">
                    <label className="reserva__label">Hora</label>
                    <select
                      name="time" value={form.time} onChange={handleChange}
                      className={errores.time ? 'error' : ''}
                    >
                      <option value="">— Hora —</option>
                      {availability.map((slot) => (
                        <option key={slot} value={slot}>{slot}</option>
                      ))}
                    </select>
                    {errores.time && <span className="reserva__error">{errores.time}</span>}
                    {availabilityStatus === 'loading' && <span className="reserva__helper">Buscando horarios disponibles...</span>}
                    {availabilityStatus === 'success' && form.barberId && form.date && form.serviceId && availability.length === 0 && (
                      <span className="reserva__helper">No hay horarios disponibles para esa selección.</span>
                    )}
                  </div>
                </div>

                <div className="reserva__field">
                  <textarea
                    name="notes"
                    placeholder="Notas para tu reserva"
                    value={form.notes}
                    onChange={handleChange}
                    rows="4"
                  />
                </div>

                <div className="reserva__actions">
                  <button type="submit" className="gold-btn gold-btn--lg" disabled={status === 'loading' || !user}>
                    {status === 'loading' ? 'Guardando reserva...' : 'Confirmar Reserva'}
                  </button>
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
