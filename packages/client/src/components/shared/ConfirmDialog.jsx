import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

export default function ConfirmDialog({ isOpen, onClose, onConfirm, title, message }) {
  const cancelBtnRef = useRef(null);
  const confirmBtnRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'Tab') {
        const cancel = cancelBtnRef.current;
        const confirm = confirmBtnRef.current;
        const focusable = [cancel, confirm].filter(Boolean);
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    cancelBtnRef.current?.focus();
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-title"
      aria-describedby="confirm-message"
    >
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="relative z-10 flex items-center justify-center min-h-full p-4">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6 sm:p-8">
          <h3 id="confirm-title" className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
            {title || 'Confirmer'}
          </h3>
          <p id="confirm-message" className="text-sm sm:text-base text-gray-600 mb-6">
            {message || 'Êtes-vous sûr ?'}
          </p>
          <div className="flex flex-col-reverse sm:flex-row justify-end gap-3">
            <button
              ref={cancelBtnRef}
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 active:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 transition-colors"
            >
              Annuler
            </button>
            <button
              ref={confirmBtnRef}
              onClick={onConfirm}
              className="w-full sm:w-auto px-4 py-2.5 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 active:bg-red-800 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 transition-colors"
            >
              Confirmer
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}