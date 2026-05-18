import { Outlet } from 'react-router-dom';

/**
 * AuthLayout – Mise en page des écrans d'authentification.
 * Fond dégradé, carte blanche centrée, logo et pied de page.
 * Les pages enfants (ex: Login) n'ont pas besoin de leur propre fond.
 */
export default function AuthLayout() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-indigo-50 px-4 py-6 sm:py-8">
      {/* Carte centrale responsive */}
      <main
        className="w-full max-w-md bg-white rounded-2xl shadow-xl p-4 sm:p-8"
        aria-label="Formulaire d'authentification"
      >
        {/* Logo / Nom de l'application */}
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold text-gray-900">NexusFlow</h1>
          <p className="mt-1 text-sm text-gray-500">Votre partenaire de gestion</p>
        </div>

        {/* Contenu de la page (Login, etc.) */}
        <Outlet />
      </main>

      {/* Pied de page */}
      <p className="mt-4 sm:mt-6 text-xs text-gray-400 text-center">
        © {new Date().getFullYear()} NexusFlow - Emmanuel Kouame - Tous droits réservés
      </p>
    </div>
  );
}