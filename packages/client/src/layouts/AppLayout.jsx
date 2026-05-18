import { useState, useEffect, useRef } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import api from '../services/api';
import NotificationBell from '../components/layout/NotificationBell';

// Icônes SVG inline pour chaque section (pas de dépendance externe)
const icons = {
  dashboard: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
    </svg>
  ),
  clients: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  ),
  quotes: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  ),
  invoices: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  ),
  projects: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
    </svg>
  ),
  settings: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  products: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4-8-4m16 8l-8 4-8-4m16 0h-.01M12 12h.01M12 16h.01M12 20h.01M9.593 9.593c-.779.779-2.037.779-2.816 0a2.033 2.033 0 01-.596-2.816c.779-.779 2.037-.779 2.816 0a2.033 2.033 0 01.596 2.816z" />
    </svg>
  ),
};

// Définition des liens de navigation
const navigation = [
  { to: '/dashboard', label: 'Tableau de bord', icon: icons.dashboard },
  { to: '/clients', label: 'Clients', icon: icons.clients },
  { to: '/products', label: 'Produits', icon: icons.products },
  { to: '/quotes', label: 'Devis', icon: icons.quotes },
  { to: '/invoices', label: 'Factures', icon: icons.invoices },
  { to: '/projects', label: 'Projets', icon: icons.projects },
  { to: '/settings', label: 'Paramètres', icon: icons.settings },
];

export default function AppLayout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const sidebarRef = useRef(null);
  const toggleButtonRef = useRef(null);

  // Fermer la sidebar si on clique en dehors (mobile uniquement)
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        sidebarOpen &&
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target) &&
        toggleButtonRef.current &&
        !toggleButtonRef.current.contains(event.target)
      ) {
        setSidebarOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [sidebarOpen]);

  // Fermer la sidebar lors d'un changement de route (mobile)
  useEffect(() => {
    setSidebarOpen(false);
  }, [location]);

  // Fermeture par la touche Échap
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape' && sidebarOpen) setSidebarOpen(false);
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [sidebarOpen]);

  // Bloquer le scroll du body quand la sidebar est ouverte sur mobile
  useEffect(() => {
    document.body.style.overflow = sidebarOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [sidebarOpen]);

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (e) { /* ignore */ }
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-50">
      {/* Bouton hamburger pour mobile */}
      <button
        ref={toggleButtonRef}
        aria-expanded={sidebarOpen}
        aria-controls="sidebar"
        aria-label={sidebarOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-white border border-gray-300 rounded-lg shadow-md text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        {sidebarOpen ? (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        )}
      </button>

      {/* Overlay pour mobile quand la sidebar est ouverte */}
      {sidebarOpen && (
        <div
          className="md:hidden fixed inset-0 z-30 bg-black/50 backdrop-blur-sm transition-opacity"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        id="sidebar"
        ref={sidebarRef}
        role="navigation"
        aria-label="Navigation principale"
        className={`fixed md:sticky top-0 z-40 h-screen w-64 bg-gray-900 text-white flex-shrink-0 transform transition-transform duration-300 ease-in-out overflow-y-auto
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0 md:block`}
      >
        <div className="flex flex-col h-full p-4">
          {/* Logo / marque */}
          <div className="text-2xl font-bold mb-8 px-2">
            <Link to="/dashboard" className="hover:text-indigo-300 transition-colors" onClick={() => setSidebarOpen(false)}>
              NexusFlow
            </Link>
          </div>

          {/* Navigation principale */}
          <nav className="flex-1 space-y-1">
            {navigation.map(({ to, label, icon }) => {
              const isActive = location.pathname === to;
              return (
                <Link
                  key={to}
                  to={to}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors
                    ${isActive
                      ? 'bg-indigo-600 text-white font-medium'
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                    }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  {icon}
                  <span className="text-sm">{label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Informations utilisateur et déconnexion */}
          <div className="mt-4 pt-4 border-t border-gray-700 space-y-3">
            <div className="flex items-center gap-2 px-2">
              <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white font-semibold text-sm">
                {user?.firstName?.charAt(0) || user?.email?.charAt(0) || '?'}
              </div>
              <div className="text-sm">
                <p className="font-medium text-gray-200 truncate">{user?.firstName} {user?.lastName}</p>
                <p className="text-gray-400 text-xs truncate">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 w-full px-3 py-2 text-left text-red-400 hover:text-red-300 hover:bg-gray-800 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span className="text-sm">Déconnexion</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Contenu principal */}
      <main className="flex-1 p-4 md:p-6 pt-16 md:pt-6 bg-gray-50 min-h-screen">
        <header className="sticky top-16 md:top-0 z-30 bg-gray-50 pt-2 pb-4 mb-6 flex items-center justify-between">
          <h1 className="text-xl md:text-2xl font-bold text-gray-800">NexusFlow</h1>
          <div className="flex items-center gap-2 md:gap-4">
            <NotificationBell />
            {/* Email de l'utilisateur (masqué sur mobile) */}
            <div className="hidden md:flex items-center gap-2 bg-white px-3 py-1.5 rounded-full border border-gray-200 shadow-sm text-sm text-gray-700">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
              </svg>
              <span className="truncate max-w-[160px]">{user?.email}</span>
            </div>
          </div>
        </header>
        <Outlet />
      </main>
    </div>
  );
}