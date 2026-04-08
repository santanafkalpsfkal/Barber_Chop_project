import { create } from 'zustand';
import { createReservationRequest, getMyReservationsRequest } from '../services/reservationApi';
import { useAuthStore } from './authStore';

const initialForm = {
  serviceId: '',
  barberId: '',
  date: '',
  time: '',
  notes: '',
};

function validateReservation(form) {
  const errors = {};

  if (!form.serviceId) errors.serviceId = 'Elige un servicio';
  if (!form.barberId) errors.barberId = 'Elige un barbero';
  if (!form.date) errors.date = 'Elige una fecha';
  if (!form.time) errors.time = 'Elige una hora';

  return errors;
}

export const useReservationStore = create((set, get) => ({
  form: initialForm,
  errors: {},
  submitted: false,
  reservations: [],
  lastReservation: null,
  status: 'idle',
  error: '',

  updateField: (name, value) =>
    set((state) => ({
      form: { ...state.form, [name]: value },
      errors: { ...state.errors, [name]: '' },
      error: '',
      submitted: false,
    })),

  resetForm: () =>
    set({
      form: initialForm,
      errors: {},
      submitted: false,
      lastReservation: null,
      status: 'idle',
      error: '',
    }),

  fetchMyReservations: async () => {
    const token = useAuthStore.getState().token;

    if (!token) {
      set({ reservations: [] });
      return;
    }

    try {
      const data = await getMyReservationsRequest(token);
      set({ reservations: data.reservations || [] });
    } catch {
      set({ reservations: [] });
    }
  },

  submitReservation: async () => {
    const { form } = get();
    const errors = validateReservation(form);

    if (Object.keys(errors).length > 0) {
      set({ errors, submitted: false, status: 'error' });
      return false;
    }

    const token = useAuthStore.getState().token;
    if (!token) {
      set({ status: 'error', error: 'Debes iniciar sesión o crear una cuenta para reservar.' });
      return false;
    }

    set({ status: 'loading', error: '', errors: {} });

    try {
      const { reservation } = await createReservationRequest(form, token);
      set((state) => ({
        submitted: true,
        status: 'success',
        error: '',
        lastReservation: reservation,
        reservations: reservation ? [reservation, ...state.reservations] : state.reservations,
      }));
      return true;
    } catch (error) {
      set({ status: 'error', error: error.message || 'No fue posible registrar la reserva.' });
      return false;
    }
  },
}));
