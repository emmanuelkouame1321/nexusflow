// ============================================================
// Fichier : packages/client/src/pages/invoices/InvoicesList.jsx
// ============================================================
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../services/api';
import DataTable from '../../components/shared/DataTable';
import ConfirmDialog from '../../components/shared/ConfirmDialog';
import StatusBadge from '../../components/shared/StatusBadge';

export default function InvoicesList() {
  const [invoices, setInvoices] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ search: '', status: '' });
  const [deleteTarget, setDeleteTarget] = useState(null);
  const navigate = useNavigate();

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 20 };
      if (filters.search) params.search = filters.search;
      if (filters.status) params.status = filters.status;
      const { data } = await api.get('/invoices', { params });
      setInvoices(data.invoices);
      setTotalPages(data.totalPages);
    } catch (err) {
      toast.error('Erreur lors du chargement des factures.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, [page, filters]);

  const handleDelete = async () => {
    try {
      await api.delete(`/invoices/${deleteTarget.id}`);
      toast.success('Facture supprimée.');
      setDeleteTarget(null);
      fetchInvoices();
    } catch (err) {
      toast.error('Erreur lors de la suppression.');
    }
  };

  const columns = [
    { key: 'reference', label: 'Référence' },
    { key: 'client', label: 'Client', render: (row) => row.client?.name || 'N/A' },
    { key: 'totalTTC', label: 'Total TTC', render: (row) => `${row.totalTTC?.toFixed(2)} €` },
    { key: 'status', label: 'Statut', render: (row) => <StatusBadge status={row.status} size="sm" /> },
    { key: 'dueDate', label: 'Échéance', render: (row) => row.dueDate ? new Date(row.dueDate).toLocaleDateString('fr-FR') : 'N/A' },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <div className="flex items-center gap-2 whitespace-nowrap">
          <button onClick={() => navigate(`/invoices/${row.id}`)} className="text-indigo-600 hover:text-indigo-800 text-xs sm:text-sm font-medium">Voir</button>
          <button onClick={() => setDeleteTarget(row)} className="text-red-600 hover:text-red-800 text-xs sm:text-sm font-medium">Supprimer</button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* En-tête sticky avec filtres */}
      <div className="sticky top-16 md:top-0 z-20 bg-gray-50 pt-1 pb-3 -mx-4 px-4 sm:mx-0 sm:px-0 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Factures</h2>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              placeholder="Recherche référence ou client..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full sm:w-56"
            />
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Tous les statuts</option>
              <option value="draft">Brouillon</option>
              <option value="sent">Envoyée</option>
              <option value="paid">Payée</option>
              <option value="partially_paid">Partiellement payée</option>
              <option value="overdue">En retard</option>
              <option value="cancelled">Annulée</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tableau */}
      {loading ? (
        <div className="flex justify-center py-10">
          <svg className="animate-spin h-8 w-8 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
          </svg>
        </div>
      ) : (
        <DataTable columns={columns} data={invoices} totalPages={totalPages} page={page} onPageChange={setPage} />
      )}

      {/* Confirmation de suppression */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Supprimer la facture"
        message={`Supprimer définitivement la facture ${deleteTarget?.reference} ?`}
      />
    </div>
  );
}