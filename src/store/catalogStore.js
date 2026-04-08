import { create } from 'zustand';
import { getAvailabilityRequest, getCatalogRequest } from '../services/catalogApi';

export const useCatalogStore = create((set) => ({
  services: [],
  barbers: [],
  availability: [],
  status: 'idle',
  availabilityStatus: 'idle',
  error: '',

  fetchCatalog: async () => {
    set({ status: 'loading', error: '' });

    try {
      const data = await getCatalogRequest();
      set({
        services: data.services || [],
        barbers: data.barbers || [],
        status: 'success',
        error: '',
      });
    } catch (error) {
      set({ status: 'error', error: error.message || 'No se pudo cargar el catálogo.' });
    }
  },

  fetchAvailability: async ({ barberId, date, serviceId }) => {
    if (!barberId || !date || !serviceId) {
      set({ availability: [], availabilityStatus: 'idle' });
      return;
    }

    set({ availabilityStatus: 'loading' });

    try {
      const data = await getAvailabilityRequest({ barberId, date, serviceId });
      set({ availability: data.slots || [], availabilityStatus: 'success' });
    } catch {
      set({ availability: [], availabilityStatus: 'error' });
    }
  },

  clearAvailability: () => set({ availability: [], availabilityStatus: 'idle' }),
}));