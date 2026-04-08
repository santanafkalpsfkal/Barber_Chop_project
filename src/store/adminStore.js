import { create } from 'zustand';
import {
  createAdminReservationRequest,
  deleteAdminReservationRequest,
  getAdminDashboardRequest,
  getAdminReservationsRequest,
  getAdminUsersRequest,
  updateAdminReservationRequest,
} from '../services/adminApi';
import { useAuthStore } from './authStore';

export const useAdminStore = create((set) => ({
  totals: { users: 0, reservations: 0, barbers: 0, services: 0 },
  reservationsByService: [],
  reservationsByStatus: [],
  recentReservations: [],
  users: [],
  reservations: [],
  status: 'idle',
  reservationsStatus: 'idle',
  actionStatus: 'idle',
  error: '',

  fetchDashboard: async () => {
    const token = useAuthStore.getState().token;

    if (!token) {
      set({ status: 'idle', error: '', totals: { users: 0, reservations: 0, barbers: 0, services: 0 }, reservationsByService: [], reservationsByStatus: [], recentReservations: [] });
      return;
    }

    set({ status: 'loading', error: '' });

    try {
      const data = await getAdminDashboardRequest(token);
      set({
        totals: data.totals,
        reservationsByService: data.reservationsByService,
        reservationsByStatus: data.reservationsByStatus,
        recentReservations: data.recentReservations,
        status: 'success',
        error: '',
      });
    } catch (error) {
      set({
        status: 'error',
        error: error.message || 'No fue posible cargar el dashboard.',
        totals: { users: 0, reservations: 0, barbers: 0, services: 0 },
        reservationsByService: [],
        reservationsByStatus: [],
        recentReservations: [],
      });
    }
  },

  fetchUsers: async () => {
    const token = useAuthStore.getState().token;

    if (!token) {
      set({ users: [] });
      return;
    }

    try {
      const data = await getAdminUsersRequest(token);
      set({ users: data.users || [] });
    } catch (error) {
      set({ error: error.message || 'No fue posible cargar los usuarios.' });
    }
  },

  fetchReservations: async () => {
    const token = useAuthStore.getState().token;

    if (!token) {
      set({ reservations: [], reservationsStatus: 'idle' });
      return;
    }

    set({ reservationsStatus: 'loading', error: '' });

    try {
      const data = await getAdminReservationsRequest(token);
      set({ reservations: data.reservations || [], reservationsStatus: 'success' });
    } catch (error) {
      set({ reservations: [], reservationsStatus: 'error', error: error.message || 'No fue posible cargar las reservas.' });
    }
  },

  fetchAdminData: async () => {
    await Promise.all([
      useAdminStore.getState().fetchDashboard(),
      useAdminStore.getState().fetchUsers(),
      useAdminStore.getState().fetchReservations(),
    ]);
  },

  createReservation: async (payload) => {
    const token = useAuthStore.getState().token;
    set({ actionStatus: 'loading', error: '' });

    try {
      await createAdminReservationRequest(token, payload);
      set({ actionStatus: 'success' });
      await useAdminStore.getState().fetchAdminData();
      return true;
    } catch (error) {
      set({ actionStatus: 'error', error: error.message || 'No fue posible crear la reserva.' });
      return false;
    }
  },

  updateReservation: async (reservationId, payload) => {
    const token = useAuthStore.getState().token;
    set({ actionStatus: 'loading', error: '' });

    try {
      await updateAdminReservationRequest(token, reservationId, payload);
      set({ actionStatus: 'success' });
      await useAdminStore.getState().fetchAdminData();
      return true;
    } catch (error) {
      set({ actionStatus: 'error', error: error.message || 'No fue posible actualizar la reserva.' });
      return false;
    }
  },

  deleteReservation: async (reservationId) => {
    const token = useAuthStore.getState().token;
    set({ actionStatus: 'loading', error: '' });

    try {
      await deleteAdminReservationRequest(token, reservationId);
      set({ actionStatus: 'success' });
      await useAdminStore.getState().fetchAdminData();
      return true;
    } catch (error) {
      set({ actionStatus: 'error', error: error.message || 'No fue posible eliminar la reserva.' });
      return false;
    }
  },

  clearError: () => set({ error: '' }),

  clearDashboard: () =>
    set({
      totals: { users: 0, reservations: 0, barbers: 0, services: 0 },
      reservationsByService: [],
      reservationsByStatus: [],
      recentReservations: [],
      users: [],
      reservations: [],
      status: 'idle',
      reservationsStatus: 'idle',
      actionStatus: 'idle',
      error: '',
    }),
}));
