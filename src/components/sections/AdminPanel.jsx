import { useEffect, useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { useAdminStore } from '../../store/adminStore';
import { useCatalogStore } from '../../store/catalogStore';
import { SectionHeader, Reveal } from '../ui';
import './AdminPanel.css';

const INITIAL_FORM = {
  userId: '',
  barberId: '',
  serviceId: '',
  date: '',
  time: '',
  status: 'pendiente',
  notes: '',
};

function formatDate(date, time) {
  const value = new Date(`${date}T00:00:00`);

  if (Number.isNaN(value.getTime())) {
    return `${date} · ${time}`;
  }

  return `${value.toLocaleDateString('es-CO')} · ${time}`;
}

function mapReservationToForm(reservation) {
  return {
    userId: String(reservation.usuario_id),
    barberId: String(reservation.barbero_id),
    serviceId: String(reservation.servicio_id),
    date: reservation.fecha_reserva,
    time: String(reservation.hora_reserva).slice(0, 5),
    status: reservation.estado,
    notes: reservation.notas || '',
  };
}

export default function AdminPanel() {
  const [form, setForm] = useState(INITIAL_FORM);
  const [editingReservationId, setEditingReservationId] = useState(null);

  const user = useAuthStore((state) => state.user);
  const isAdmin = user?.role === 'admin';
  const services = useCatalogStore((state) => state.services);
  const barbers = useCatalogStore((state) => state.barbers);
  const availability = useCatalogStore((state) => state.availability);
  const availabilityStatus = useCatalogStore((state) => state.availabilityStatus);
  const fetchAvailability = useCatalogStore((state) => state.fetchAvailability);
  const clearAvailability = useCatalogStore((state) => state.clearAvailability);

  const {
    totals,
    reservationsByService,
    reservationsByStatus,
    recentReservations,
    users,
    reservations,
    status,
    reservationsStatus,
    actionStatus,
    error,
    fetchAdminData,
    createReservation,
    updateReservation,
    deleteReservation,
    clearDashboard,
    clearError,
  } = useAdminStore();

  useEffect(() => {
    if (!isAdmin) {
      clearDashboard();
      return;
    }

    fetchAdminData();
  }, [isAdmin, fetchAdminData, clearDashboard]);

  useEffect(() => {
    if (!isAdmin) {
      return undefined;
    }

    fetchAvailability({ barberId: form.barberId, date: form.date, serviceId: form.serviceId });

    return undefined;
  }, [form.barberId, form.date, form.serviceId, fetchAvailability, isAdmin]);

  useEffect(() => () => clearAvailability(), [clearAvailability]);

  if (!isAdmin) {
    return null;
  }

  const handleChange = (event) => {
    const { name, value } = event.target;
    clearError();
    setForm((current) => ({
      ...current,
      [name]: value,
      ...(name === 'barberId' || name === 'date' || name === 'serviceId' ? { time: '' } : {}),
    }));
  };

  const resetForm = () => {
    clearError();
    setEditingReservationId(null);
    setForm(INITIAL_FORM);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const ok = editingReservationId
      ? await updateReservation(editingReservationId, form)
      : await createReservation(form);

    if (ok) {
      resetForm();
    }
  };

  const handleEdit = (reservation) => {
    clearError();
    setEditingReservationId(reservation.id);
    setForm(mapReservationToForm(reservation));
  };

  const handleDelete = async (reservationId) => {
    const confirmed = window.confirm('Esta acción eliminará la reserva definitivamente.');
    if (!confirmed) {
      return;
    }

    await deleteReservation(reservationId);
    if (editingReservationId === reservationId) {
      resetForm();
    }
  };

  return (
    <section id="admin" className="admin-panel-section">
      <div className="container">
        <Reveal>
          <div className="admin-panel">
            <SectionHeader
              tag="Admin"
              title="Panel de administración"
              subtitle="Métricas protegidas para el equipo interno. Solo las cuentas con rol admin pueden consultar usuarios y reservas."
              center={false}
            />

            {status === 'error' && <p className="admin-panel__error">{error}</p>}

            <div className="admin-panel__stats">
              <article className="admin-panel__stat-card">
                <span className="admin-panel__stat-label">Usuarios registrados</span>
                <strong>{totals.users}</strong>
              </article>
              <article className="admin-panel__stat-card">
                <span className="admin-panel__stat-label">Reservas registradas</span>
                <strong>{totals.reservations}</strong>
              </article>
              <article className="admin-panel__stat-card">
                <span className="admin-panel__stat-label">Barberos activos</span>
                <strong>{totals.barbers}</strong>
              </article>
              <article className="admin-panel__stat-card">
                <span className="admin-panel__stat-label">Servicios activos</span>
                <strong>{totals.services}</strong>
              </article>
            </div>

            <div className="admin-panel__crud-grid">
              <div className="admin-panel__block">
                <div className="admin-panel__block-head">
                  <h3>{editingReservationId ? 'Editar reserva' : 'Crear reserva'}</h3>
                  {editingReservationId && (
                    <button type="button" className="admin-panel__ghost-btn" onClick={resetForm}>
                      Cancelar edición
                    </button>
                  )}
                </div>

                <form className="admin-panel__form" onSubmit={handleSubmit}>
                  <label className="admin-panel__field">
                    <span>Usuario</span>
                    <select name="userId" value={form.userId} onChange={handleChange} required>
                      <option value="">Selecciona un usuario</option>
                      {users.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.fullName} · {item.email} · {item.role}
                        </option>
                      ))}
                    </select>
                  </label>

                  <div className="admin-panel__form-row">
                    <label className="admin-panel__field">
                      <span>Barbero</span>
                      <select name="barberId" value={form.barberId} onChange={handleChange} required>
                        <option value="">Selecciona un barbero</option>
                        {barbers.map((item) => (
                          <option key={item.id} value={item.id}>{item.nombre} · {item.especialidad}</option>
                        ))}
                      </select>
                    </label>

                    <label className="admin-panel__field">
                      <span>Servicio</span>
                      <select name="serviceId" value={form.serviceId} onChange={handleChange} required>
                        <option value="">Selecciona un servicio</option>
                        {services.map((item) => (
                          <option key={item.id} value={item.id}>{item.nombre} · ${Number(item.precio).toLocaleString('es-CO')}</option>
                        ))}
                      </select>
                    </label>
                  </div>

                  <div className="admin-panel__form-row">
                    <label className="admin-panel__field">
                      <span>Fecha</span>
                      <input type="date" name="date" value={form.date} onChange={handleChange} required />
                    </label>

                    <label className="admin-panel__field">
                      <span>Hora</span>
                      <select name="time" value={form.time} onChange={handleChange} required>
                        <option value="">Selecciona una hora</option>
                        {availability.map((slot) => (
                          <option key={slot} value={slot}>{slot}</option>
                        ))}
                        {editingReservationId && form.time && !availability.includes(form.time) && (
                          <option value={form.time}>{form.time}</option>
                        )}
                      </select>
                      {availabilityStatus === 'loading' && <small className="admin-panel__helper">Consultando disponibilidad...</small>}
                    </label>
                  </div>

                  <label className="admin-panel__field">
                    <span>Estado</span>
                    <select name="status" value={form.status} onChange={handleChange} required>
                      <option value="pendiente">Pendiente</option>
                      <option value="confirmada">Confirmada</option>
                      <option value="completada">Completada</option>
                      <option value="cancelada">Cancelada</option>
                    </select>
                  </label>

                  <label className="admin-panel__field">
                    <span>Notas</span>
                    <textarea name="notes" value={form.notes} onChange={handleChange} rows="4" placeholder="Observaciones de la reserva" />
                  </label>

                  <div className="admin-panel__form-actions">
                    <button type="submit" className="gold-btn gold-btn--md" disabled={actionStatus === 'loading'}>
                      {actionStatus === 'loading'
                        ? 'Guardando...'
                        : editingReservationId
                          ? 'Actualizar reserva'
                          : 'Crear reserva'}
                    </button>
                    <button type="button" className="admin-panel__ghost-btn" onClick={resetForm}>
                      Limpiar
                    </button>
                  </div>
                </form>
              </div>

              <div className="admin-panel__block">
                <h3>Gestionar reservas</h3>
                {reservationsStatus === 'loading' ? (
                  <p className="admin-panel__empty">Cargando reservas...</p>
                ) : reservations.length === 0 ? (
                  <p className="admin-panel__empty">No hay reservas para administrar.</p>
                ) : (
                  <div className="admin-panel__manager-list">
                    {reservations.map((reservation) => (
                      <article key={reservation.id} className="admin-panel__manager-card">
                        <div className="admin-panel__manager-top">
                          <div>
                            <strong>#{reservation.id} · {reservation.cliente_nombre}</strong>
                            <span>{reservation.servicio_nombre} con {reservation.barbero_nombre}</span>
                          </div>
                          <span className={`admin-panel__status admin-panel__status--${reservation.estado}`}>{reservation.estado}</span>
                        </div>
                        <div className="admin-panel__manager-meta">
                          <span>{formatDate(reservation.fecha_reserva, reservation.hora_reserva)}</span>
                          <span>{reservation.cliente_email}</span>
                          <span>{reservation.notas || 'Sin notas'}</span>
                        </div>
                        <div className="admin-panel__manager-actions">
                          <button type="button" className="admin-panel__ghost-btn" onClick={() => handleEdit(reservation)}>Editar</button>
                          <button type="button" className="admin-panel__danger-btn" onClick={() => handleDelete(reservation.id)}>Eliminar</button>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="admin-panel__grid">
              <div className="admin-panel__block">
                <h3>Reservas por servicio</h3>
                {status === 'loading' ? (
                  <p className="admin-panel__empty">Cargando métricas...</p>
                ) : reservationsByService.length === 0 ? (
                  <p className="admin-panel__empty">Aún no hay reservas registradas.</p>
                ) : (
                  <ul className="admin-panel__service-list">
                    {reservationsByService.map((item) => (
                      <li key={item.service} className="admin-panel__service-row">
                        <span>{item.service}</span>
                        <strong>{item.total}</strong>
                      </li>
                    ))}
                  </ul>
                )}

                <h3 className="admin-panel__subheading">Reservas por estado</h3>
                {status === 'loading' ? (
                  <p className="admin-panel__empty">Cargando estados...</p>
                ) : reservationsByStatus.length === 0 ? (
                  <p className="admin-panel__empty">Aún no hay estados para mostrar.</p>
                ) : (
                  <ul className="admin-panel__service-list">
                    {reservationsByStatus.map((item) => (
                      <li key={item.status} className="admin-panel__service-row">
                        <span>{item.status}</span>
                        <strong>{item.total}</strong>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="admin-panel__block">
                <h3>Últimas reservas</h3>
                {status === 'loading' ? (
                  <p className="admin-panel__empty">Cargando actividad...</p>
                ) : recentReservations.length === 0 ? (
                  <p className="admin-panel__empty">Aún no hay actividad para mostrar.</p>
                ) : (
                  <div className="admin-panel__reservations">
                    {recentReservations.map((reservation) => (
                      <article key={reservation.id} className="admin-panel__reservation-card">
                        <div>
                          <strong>{reservation.cliente_nombre}</strong>
                          <span>{reservation.cliente_email}</span>
                        </div>
                        <div>
                          <strong>{reservation.servicio_nombre}</strong>
                          <span>{formatDate(reservation.fecha_reserva, reservation.hora_reserva)}</span>
                        </div>
                        <div>
                          <strong>Barbero</strong>
                          <span>{reservation.barbero_nombre}</span>
                        </div>
                        <div>
                          <strong>Estado</strong>
                          <span className={`admin-panel__status admin-panel__status--${reservation.estado}`}>{reservation.estado}</span>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
