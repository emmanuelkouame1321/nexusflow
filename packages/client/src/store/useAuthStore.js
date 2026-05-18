import { create } from 'zustand';
import api from '../services/api';

export const useAuthStore = create((set) => ({
  // États
  user: null,
  isAuthenticated: false,

  // Action : connexion
  login: async (credentials) => {
    const { data } = await api.post('/auth/login', credentials);
    set({ user: data.user, isAuthenticated: true });
    return data;
  },

  // Action : récupérer l'utilisateur connecté
  fetchUser: async () => {
    try {
      const { data } = await api.get('/auth/me');
      set({ user: data.user, isAuthenticated: true });
    } catch {
      set({ user: null, isAuthenticated: false });
    }
  },

  // Action : déconnexion
  logout: () => {
    set({ user: null, isAuthenticated: false });
  },
}));