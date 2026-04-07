import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { loginRequest, meRequest, registerRequest } from '../services/authApi';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      token: '',
      user: null,
      status: 'idle',
      error: '',
      mode: 'login',

      setMode: (mode) => set({ mode, error: '' }),
      clearError: () => set({ error: '' }),

      login: async (credentials) => {
        set({ status: 'loading', error: '' });

        try {
          const { token, user } = await loginRequest(credentials);
          set({ token, user, status: 'authenticated', error: '' });
        } catch (error) {
          set({ status: 'error', error: error.message || 'No fue posible iniciar sesión.' });
        }
      },

      register: async (payload) => {
        set({ status: 'loading', error: '' });

        try {
          const { token, user } = await registerRequest(payload);
          set({ token, user, status: 'authenticated', error: '' });
        } catch (error) {
          set({ status: 'error', error: error.message || 'No fue posible crear la cuenta.' });
        }
      },

      hydrateSession: async () => {
        const { token } = get();
        if (!token) {
          return;
        }

        set({ status: 'loading', error: '' });

        try {
          const { user } = await meRequest(token);
          set({ user, status: 'authenticated', error: '' });
        } catch (error) {
          set({ token: '', user: null, status: 'idle', error: error.message || '' });
        }
      },

      logout: () => set({ token: '', user: null, status: 'idle', error: '', mode: 'login' }),
    }),
    {
      name: 'barberking-auth',
      storage: createJSONStorage(() => window.localStorage),
      partialize: (state) => ({ token: state.token, user: state.user, mode: state.mode }),
    }
  )
);