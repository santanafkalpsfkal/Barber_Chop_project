import { create } from 'zustand';
import { getAdminDashboardRequest } from '../services/adminApi';
import { useAuthStore } from './authStore';

export const useAdminStore = create((set) => ({
  totals: { users: 0, reservations: 0, barbers: 0, services: 0 },
  reservationsByService: [],
  reservationsByStatus: [],
  recentReservations: [],
  status: 'idle',
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

  clearDashboard: () =>
    set({
      totals: { users: 0, reservations: 0, barbers: 0, services: 0 },
      reservationsByService: [],
      reservationsByStatus: [],
      recentReservations: [],
      status: 'idle',
      error: '',
    }),
}));
