const statusConfig = {
  draft:       { label: 'Brouillon',            color: 'bg-gray-200 text-gray-700' },
  sent:        { label: 'Envoyé',               color: 'bg-blue-200 text-blue-800' },
  accepted:    { label: 'Accepté',              color: 'bg-green-200 text-green-800' },
  refused:     { label: 'Refusé',               color: 'bg-red-200 text-red-800' },
  expired:     { label: 'Expiré',               color: 'bg-yellow-200 text-yellow-800' },
  paid:        { label: 'Payée',                color: 'bg-green-200 text-green-800' },
  partially_paid: { label: 'Partiellement payée', color: 'bg-orange-200 text-orange-800' },
  overdue:     { label: 'En retard',            color: 'bg-red-200 text-red-800' },
  cancelled:   { label: 'Annulé',               color: 'bg-gray-300 text-gray-600' },
  planned:     { label: 'Planifié',             color: 'bg-purple-200 text-purple-800' },
  in_progress: { label: 'En cours',             color: 'bg-blue-200 text-blue-800' },
  completed:   { label: 'Terminé',              color: 'bg-green-200 text-green-800' },
  on_hold:     { label: 'En pause',             color: 'bg-yellow-200 text-yellow-800' },
  todo:        { label: 'À faire',              color: 'bg-gray-200 text-gray-600' },
  in_review:   { label: 'En révision',          color: 'bg-indigo-200 text-indigo-800' },
  done:        { label: 'Terminé',              color: 'bg-green-200 text-green-800' },
};

export default function StatusBadge({ status, size = 'md' }) {
  const config = statusConfig[status] || { label: status, color: 'bg-gray-100 text-gray-600' };

  const sizeClasses = {
    xs: 'text-[10px] px-1.5 py-0.5',
    sm: 'text-xs px-2 py-0.5',
    md: 'text-xs sm:text-sm px-2 py-0.5 sm:px-3 sm:py-1',
    lg: 'text-sm sm:text-base px-3 py-1 sm:px-4 sm:py-1.5',
  };

  return (
    <span
      aria-label={`Statut : ${config.label}`}
      className={`inline-flex items-center rounded-full font-semibold whitespace-nowrap ${sizeClasses[size] || sizeClasses.md} ${config.color}`}
    >
      {config.label}
    </span>
  );
}