import { useAuthStore } from '../store/useAuthStore';

/**
 * Retourne true si l'utilisateur connecté possède l'un des rôles passés en paramètres.
 * Exemple : const canEdit = useHasRole('admin', 'manager');
 */
export function useHasRole(...roles) {
  const user = useAuthStore((state) => state.user);
  return user && roles.includes(user.role?.name);
}