import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

export default function FormModal({ isOpen, onClose, title, children }) {
  const closeButtonRef = useRef(null);

  // Échap → fermer
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  // Focus sur le bouton de fermeture à l'ouverture
  useEffect(() => {
    if (isOpen) closeButtonRef.current?.focus();
  }, [isOpen]);

  // Bloquer le scroll du body
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Conteneur centré */}
      <div className="relative z-10 flex items-center justify-center min-h-full p-4">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[85vh] sm:max-h-[90vh] overflow-y-auto overscroll-contain p-5 sm:p-8">
          {/* En-tête */}
          <div className="flex items-start justify-between mb-4">
            <h2 id="modal-title" className="text-xl sm:text-2xl font-semibold text-gray-900 pr-4">
              {title}
            </h2>
            <button
              ref={closeButtonRef}
              onClick={onClose}
              aria-label="Fermer la modale"
              className="flex-shrink-0 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-400 rounded-full p-2 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          {/* Contenu */}
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
}