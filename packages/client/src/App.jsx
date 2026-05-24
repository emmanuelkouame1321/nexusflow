import { useEffect, useState, Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Layouts – chargés normalement car toujours utilisés
import AuthLayout from './layouts/AuthLayout';
import AppLayout from './layouts/AppLayout';

// Pages – chargées à la demande
const Login = lazy(() => import('./pages/auth/Login'));
const Dashboard = lazy(() => import('./pages/dashboard/Dashboard'));
const ClientsList = lazy(() => import('./pages/clients/ClientsList'));
const ClientDetail = lazy(() => import('./pages/clients/ClientDetail'));
const QuotesList = lazy(() => import('./pages/quotes/QuotesList'));
const QuoteDetail = lazy(() => import('./pages/quotes/QuoteDetail'));
const InvoicesList = lazy(() => import('./pages/invoices/InvoicesList'));
const InvoiceDetail = lazy(() => import('./pages/invoices/InvoiceDetail'));
const ProjectsList = lazy(() => import('./pages/projects/ProjectsList'));
const ProjectDetail = lazy(() => import('./pages/projects/ProjectDetail'));
const Notifications = lazy(() => import('./pages/notifications/Notifications'));
const Settings = lazy(() => import('./pages/settings/Settings'));
const Emails = lazy(() => import('./pages/emails/Emails'));
const ProductsList = lazy(() => import('./pages/products/ProductsList'));
import Profile from './pages/profile/Profile';

import { useAuthStore } from './store/useAuthStore';
import AdminRoute from './components/AdminRoute';

// Spinner affiché pendant le chargement des pages lazy
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
  </div>
);

// --------------------------------------------------
// ProtectedLayout : vérifie l'authentification
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

  if (loading) {
    return <PageLoader />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <AppLayout />;
}

// --------------------------------------------------
// Composant principal App
// --------------------------------------------------
export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Routes publiques */}
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<Login />} />
          </Route>

          {/* Routes protégées */}
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
            <Route path="/settings" element={<AdminRoute><Settings /></AdminRoute>} />
            <Route path="/emails" element={<Emails />} />
            <Route path="/products" element={<ProductsList />} />
            <Route path="/profile" element={<Profile />} />
          </Route>
        </Routes>
      </Suspense>

      {/* Toasts – toujours présents, hors Suspense pour ne pas retarder leur affichage */}
      <ToastContainer
        position="bottom-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable={false}
        pauseOnHover
        theme="light"
      />
    </BrowserRouter>
  );
}