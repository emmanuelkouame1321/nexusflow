import axios from 'axios';
import { useAuthStore } from '../store/useAuthStore';

// Création de l'instance avec la base de l'API et les cookies activés
const api = axios.create({
  baseURL: '/api/v1',           // Toutes les requêtes partent vers /api/v1/...
  withCredentials: true,        // Envoie les cookies (accessToken, refreshToken)
  headers: {
    'Content-Type': 'application/json',
  },
});

// Variables pour éviter les refreshs multiples simultanés
let isRefreshing = false;
let failedQueue = [];

// Fonction qui vide la file d'attente après un refresh
const processQueue = (error, token = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token);
    }
  });
  failedQueue = [];
};

// Intercepteur de réponse
api.interceptors.response.use(
  (response) => response,   // Succès : on laisse passer
  async (error) => {
    const originalRequest = error.config;

    // Si erreur 401 et qu'on n'a pas déjà essayé de refresh
    if (error.response?.status === 401 && !originalRequest._retry) {

      // Si un refresh est déjà en cours, on met en file d'attente
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => api(originalRequest))
          .catch((err) => Promise.reject(err));
      }

      // Marque cette requête comme "déjà tentée"
      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Tentative de refresh du token
        await axios.post('/api/v1/auth/refresh', {}, { withCredentials: true });

        // Succès : on vide la file d'attente et on réessaie la requête originale
        isRefreshing = false;
        processQueue(null);
        return api(originalRequest);

      } catch (refreshError) {
        // Échec du refresh : on déconnecte l'utilisateur
        isRefreshing = false;
        processQueue(refreshError);

        // Déconnexion via le store Zustand
        const store = useAuthStore.getState();
        store.logout();

        // Redirection vers la page de connexion
        window.location.href = '/login';

        return Promise.reject(refreshError);
      }
    }

    // Pour toute autre erreur, on la transmet telle quelle
    return Promise.reject(error);
  }
);

export default api;