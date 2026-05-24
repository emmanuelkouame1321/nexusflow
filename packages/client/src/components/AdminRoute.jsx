import { Navigate } from 'react-router-dom';
import { useHasRole } from '../hooks/useHasRole';

export default function AdminRoute({ children }) {
  const isAdmin = useHasRole('admin');
  return isAdmin ? children : <Navigate to="/dashboard" replace />;
}