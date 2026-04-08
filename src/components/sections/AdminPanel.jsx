import { useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import { useAdminStore } from '../../store/adminStore';
import { SectionHeader, Reveal } from '../ui';
import './AdminPanel.css';

function formatDate(date, time) {
  const value = new Date(`${date}T00:00:00`);

  if (Number.isNaN(value.getTime())) {
    return `${date} · ${time}`;
  }

  return `${value.toLocaleDateString('es-CO')} · ${time}`;
}

export default function AdminPanel() {
  const user = useAuthStore((state) => state.user);
  const isAdmin = user?.role === 'admin';

  const {
    totals,
    reservationsByService,
    reservationsByStatus,
    recentReservations,
    status,
    error,
    fetchDashboard,
    clearDashboard,
  } = useAdminStore();

  useEffect(() => {
    if (!isAdmin) {
      clearDashboard();
      return;
    }

    fetchDashboard();
  }, [isAdmin, fetchDashboard, clearDashboard]);

  if (!isAdmin) {
    return null;
  }

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
