import { useState, useEffect } from 'react';

// Carte pour mobile : chaque ligne devient une carte verticale
function MobileCard({ columns, row }) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-3 space-y-2">
      {columns.map((col) => (
        <div key={col.key} className="flex justify-between items-baseline text-sm">
          <span className="text-gray-500 font-medium">{col.label}</span>
          <span className="text-gray-900 text-right">
            {col.render ? col.render(row) : row[col.key] ?? '—'}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function DataTable({
  columns,
  data,
  totalPages = 1,
  page = 1,
  onPageChange,
  onSort,
  sortColumn,
  sortDirection,
}) {
  // Détection réactive du mobile
  const [isMobile, setIsMobile] = useState(false);
  const [forceTableMode, setForceTableMode] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia('(max-width: 639px)');
    const handleChange = (e) => setIsMobile(e.matches);
    setIsMobile(mql.matches);
    mql.addEventListener('change', handleChange);
    return () => mql.removeEventListener('change', handleChange);
  }, []);

  // Sur mobile, cartes par défaut, sauf si l'utilisateur force le tableau
  const useCards = isMobile && !forceTableMode;

  return (
    <div>
      {/* Bouton de bascule visible uniquement sur mobile */}
      <div className="sm:hidden mb-2 text-right">
        <button
          onClick={() => setForceTableMode(!forceTableMode)}
          className="text-xs text-indigo-600 underline"
        >
          {forceTableMode ? 'Voir en liste' : 'Voir en tableau'}
        </button>
      </div>

      {/* VERSION CARTES (mobile) */}
      {useCards && (
        <div className="space-y-3">
          {data.length === 0 ? (
            <p className="text-center text-gray-400 py-6">Aucune donnée</p>
          ) : (
            data.map((row, index) => (
              <MobileCard key={row.id || index} columns={columns} row={row} />
            ))
          )}
        </div>
      )}

      {/* VERSION TABLEAU (desktop ou mobile forcé) */}
      {!useCards && (
        <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
          <table className="min-w-full bg-white" aria-label="Tableau de données">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                {columns.map((col) => {
                  const isSorted = sortColumn === col.key;
                  let ariaSort = 'none';
                  if (isSorted) ariaSort = sortDirection === 'asc' ? 'ascending' : 'descending';
                  return (
                    <th
                      key={col.key}
                      scope="col"
                      className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider select-none whitespace-nowrap"
                      aria-sort={onSort ? ariaSort : undefined}
                    >
                      {onSort ? (
                        <button
                          type="button"
                          className="flex items-center gap-1 hover:text-gray-700 transition-colors"
                          onClick={() => onSort(col.key)}
                        >
                          {col.label}
                          {isSorted && (
                            <span className="text-indigo-600 text-lg leading-none">
                              {sortDirection === 'asc' ? '▲' : '▼'}
                            </span>
                          )}
                        </button>
                      ) : (
                        col.label
                      )}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="px-4 py-10 text-center text-gray-400">
                    Aucune donnée
                  </td>
                </tr>
              ) : (
                data.map((row, index) => (
                  <tr key={row.id || index} className="hover:bg-gray-50 transition-colors">
                    {columns.map((col) => (
                      <td key={col.key} className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">
                        {col.render ? col.render(row) : row[col.key] ?? '—'}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row justify-between items-center gap-3 mt-4 px-2">
          <span className="text-xs sm:text-sm text-gray-600">
            Page {page} sur {totalPages}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => onPageChange(page - 1)}
              disabled={page <= 1}
              className="px-3 py-2 text-xs sm:text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-colors"
            >
              ← Précédent
            </button>
            <button
              onClick={() => onPageChange(page + 1)}
              disabled={page >= totalPages}
              className="px-3 py-2 text-xs sm:text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-colors"
            >
              Suivant →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}