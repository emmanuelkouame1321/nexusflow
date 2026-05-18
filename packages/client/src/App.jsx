import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';

// Layouts
import AuthLayout from './layouts/AuthLayout';
import AppLayout from './layouts/AppLayout';

// Pages (certaines sont encore des placeholders, nous les compléterons)
import Login from './pages/auth/Login';
import Dashboard from './pages/dashboard/Dashboard';
import ClientsList from './pages/clients/ClientsList';
import ClientDetail from './pages/clients/ClientDetail';
import QuotesList from './pages/quotes/QuotesList';
import QuoteDetail from './pages/quotes/QuoteDetail';
import InvoicesList from './pages/invoices/InvoicesList';
import InvoiceDetail from './pages/invoices/InvoiceDetail';
import ProjectsList from './pages/projects/ProjectsList';
import ProjectDetail from './pages/projects/ProjectDetail';
import Notifications from './pages/notifications/Notifications';
import Settings from './pages/settings/Settings';
import Emails from './pages/emails/Emails';
import ProductsList from './pages/products/ProductsList';

// Store d'authentification
import { useAuthStore } from './store/useAuthStore';

// --------------------------------------------------
// Composant ProtectedLayout : vérifie l'authentification
// --------------------------------------------------
function ProtectedLayout() {
  const { isAuthenticated, fetchUser } = useAuthStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const checkAuth = async () => {
      await fetchUser();
      if (!cancelled) setLoading(false);
    };
    checkAuth();
    return () => { cancelled = true; };
  }, [fetchUser]);

  // Spinner pendant la vérification
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // Si non authentifié, rediriger vers /login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Authentifié : afficher le layout principal avec la sidebar
  return <AppLayout />;
}

// --------------------------------------------------
// Composant principal App
// --------------------------------------------------
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Routes publiques : pas de sidebar, juste la carte d'authentification */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
        </Route>

        {/* Routes protégées : vérification auth + layout avec sidebar */}
        <Route element={<ProtectedLayout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/clients" element={<ClientsList />} />
          <Route path="/clients/:id" element={<ClientDetail />} />
          <Route path="/quotes" element={<QuotesList />} />
          <Route path="/quotes/:id" element={<QuoteDetail />} />
          <Route path="/invoices" element={<InvoicesList />} />
          <Route path="/invoices/:id" element={<InvoiceDetail />} />
          <Route path="/projects" element={<ProjectsList />} />
          <Route path="/projects/:id" element={<ProjectDetail />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/emails" element={<Emails />} />
          <Route path="/products" element={<ProductsList />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}