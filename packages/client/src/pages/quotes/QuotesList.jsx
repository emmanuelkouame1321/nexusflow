import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../services/api';
import DataTable from '../../components/shared/DataTable';
import FormModal from '../../components/shared/FormModal';
import ConfirmDialog from '../../components/shared/ConfirmDialog';
import StatusBadge from '../../components/shared/StatusBadge';
import QuoteFormModal from '../../components/quotes/QuoteFormModal';

export default function QuotesList() {
  const [quotes, setQuotes] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ status: '', search: '' });
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedQuote, setSelectedQuote] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const canCreate = useHasRole('admin', 'manager', 'commercial');
  const canChangeStatus = useHasRole('admin', 'manager');
  const canDelete = useHasRole('admin');
  const navigate = useNavigate();


  const fetchQuotes = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 20 };
      if (filters.status) params.status = filters.status;
      if (filters.search) params.search = filters.search;
      const { data } = await api.get('/quotes', { params });
      setQuotes(data.quotes);
      setTotalPages(data.totalPages);
    } catch (err) {
      toast.error('Erreur lors du chargement des devis.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuotes();
  }, [page, filters]);

  const handleCreate = async (formData) => {
    try {
      await api.post('/quotes', formData);
      toast.success('Devis créé avec succès.');
      setShowCreateForm(false);
      fetchQuotes();
    } catch (err) {
      const message = err.response?.data?.message || "Erreur lors de la création du devis.";
      toast.error(message);
    }
  };

  const handleStatusChange = async () => {
    try {
      await api.patch(`/quotes/${selectedQuote.id}/status`, { status: newStatus });
      toast.success(`Devis ${selectedQuote.reference} passé en "${newStatus}".`);
      setShowStatusModal(false);
      setSelectedQuote(null);
      fetchQuotes();
    } catch (err) {
      toast.error('Erreur lors du changement de statut.');
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/quotes/${deleteTarget.id}`);
      toast.success('Devis supprimé.');
      setDeleteTarget(null);
      fetchQuotes();
    } catch (err) {
      toast.error('Erreur lors de la suppression.');
    }
  };

  const columns = [
    { key: 'reference', label: 'Référence' },
    { key: 'client', label: 'Client', render: (row) => row.client?.name || 'N/A' },
    { key: 'totalTTC', label: 'Total TTC', render: (row) => `${row.totalTTC?.toFixed(2)} €` },
    { key: 'status', label: 'Statut', render: (row) => <StatusBadge status={row.status} size="sm" /> },
    { key: 'validUntil', label: 'Validité', render: (row) => row.validUntil ? new Date(row.validUntil).toLocaleDateString('fr-FR') : 'N/A' },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <div className="flex items-center gap-2 whitespace-nowrap">
          <button onClick={() => navigate(`/quotes/${row.id}`)} className="text-indigo-600 hover:text-indigo-800 text-xs sm:text-sm font-medium">Voir</button>
          {canChangeStatus && 
          <button onClick={() => { setSelectedQuote(row); setNewStatus(row.status); setShowStatusModal(true); }} className="text-blue-600 hover:text-blue-800 text-xs sm:text-sm font-medium">Statut</button>}
          {canDelete &&
          <button onClick={() => setDeleteTarget(row)} className="text-red-600 hover:text-red-800 text-xs sm:text-sm font-medium">Supprimer</button>}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* En-tête avec filtres et bouton Nouveau devis */}
      <div className="sticky top-16 md:top-0 z-20 bg-gray-50 pt-1 pb-3 -mx-4 px-4 sm:mx-0 sm:px-0 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Devis</h2>
            {canCreate &&
            <button
              onClick={() => setShowCreateForm(true)}
              className="inline-flex items-center gap-2 px-3 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 shadow-sm transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span className="hidden sm:inline">Nouveau devis</span>
            </button>
            }
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Tous les statuts</option>
              <option value="draft">Brouillon</option>
              <option value="sent">Envoyé</option>
              <option value="accepted">Accepté</option>
              <option value="refused">Refusé</option>
            </select>
            <input
              type="text"
              placeholder="Recherche référence ou client..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full sm:w-56"
            />
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
        <DataTable columns={columns} data={quotes} totalPages={totalPages} page={page} onPageChange={setPage} />
      )}

      {/* Modale changement de statut */}
      {showStatusModal && (
        <FormModal isOpen={true} onClose={() => setShowStatusModal(false)} title={`Changer le statut du devis ${selectedQuote?.reference}`}>
          <div className="space-y-4">
            <select value={newStatus} onChange={(e) => setNewStatus(e.target.value)} className="block w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
              <option value="draft">Brouillon</option>
              <option value="sent">Envoyé</option>
              <option value="accepted">Accepté</option>
              <option value="refused">Refusé</option>
            </select>
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowStatusModal(false)} className="px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 text-sm font-medium">Annuler</button>
              <button onClick={handleStatusChange} className="px-4 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium">Appliquer</button>
            </div>
          </div>
        </FormModal>
      )}

      {/* Confirmation suppression */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Supprimer le devis"
        message={`Supprimer définitivement ${deleteTarget?.reference} ?`}
      />

      {/* Formulaire de création de devis */}
      {showCreateForm && (
        <QuoteFormModal
          onClose={() => setShowCreateForm(false)}
          onSave={handleCreate}
        />
      )}
    </div>
  );
}