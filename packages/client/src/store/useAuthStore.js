import { create } from 'zustand';
import api from '../services/api';

export const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: false,

  login: async (credentials) => {
    const { data } = await api.post('/auth/login', credentials);
    set({ user: data.user, isAuthenticated: true });
    return data;
  },

  fetchUser: async () => {
    try {
      const { data } = await api.get('/auth/me');
      set({ user: data.user, isAuthenticated: true });
    } catch {
      set({ user: null, isAuthenticated: false });
    }
  },

  logout: () => {
    set({ user: null, isAuthenticated: false });
  },
}));