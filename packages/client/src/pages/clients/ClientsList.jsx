import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../services/api';
import DataTable from '../../components/shared/DataTable';
import FormModal from '../../components/shared/FormModal';
import ConfirmDialog from '../../components/shared/ConfirmDialog';
import SalesPipeline from './SalesPipeline';

export default function ClientsList() {
  const [clients, setClients] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const navigate = useNavigate();

  const fetchClients = async (p = page) => {
    setLoading(true);
    try {
      const { data } = await api.get(`/clients?page=${p}`);
      setClients(data.clients);
      setTotalPages(data.totalPages);
      setPage(data.page);
    } catch (err) {
      toast.error('Erreur lors du chargement des clients.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, [page]);

  const handleSave = async (formData) => {
    try {
      if (editingClient) {
        await api.put(`/clients/${editingClient.id}`, formData);
        toast.success('Client modifié avec succès.');
      } else {
        await api.post('/clients', formData);
        toast.success('Client créé avec succès.');
      }
      setShowForm(false);
      setEditingClient(null);
      fetchClients();
    } catch (err) {
      if (err.response?.status === 409) {
        toast.error('Un client avec cet email ou téléphone existe déjà.');
      } else {
        toast.error('Erreur lors de l\'enregistrement.');
      }
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/clients/${deleteTarget.id}`);
      toast.success('Client supprimé.');
      setDeleteTarget(null);
      fetchClients();
    } catch (err) {
      toast.error('Erreur lors de la suppression.');
    }
  };

  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'name', label: 'Nom' },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Téléphone' },
    { key: 'sector', label: 'Secteur' },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <div className="flex items-center gap-2 whitespace-nowrap">
          <button
            onClick={() => navigate(`/clients/${row.id}`)}
            className="text-indigo-600 hover:text-indigo-800 text-xs sm:text-sm font-medium transition-colors"
            aria-label={`Voir le client ${row.name}`}
          >
            Voir
          </button>
          <button
            onClick={() => { setEditingClient(row); setShowForm(true); }}
            className="text-blue-600 hover:text-blue-800 text-xs sm:text-sm font-medium transition-colors"
            aria-label={`Modifier le client ${row.name}`}
          >
            Modifier
          </button>
          <button
            onClick={() => setDeleteTarget(row)}
            className="text-red-600 hover:text-red-800 text-xs sm:text-sm font-medium transition-colors"
            aria-label={`Supprimer le client ${row.name}`}
          >
            Supprimer
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* En-tête sticky */}
      <div className="sticky top-16 md:top-0 z-20 bg-gray-50 pt-1 pb-3 -mx-4 px-4 sm:mx-0 sm:px-0 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Clients</h2>
        <button
          onClick={() => { setEditingClient(null); setShowForm(true); }}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 shadow-sm transition-colors text-sm sm:text-base self-end sm:self-auto"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          <span className="hidden sm:inline">Nouveau client</span>
          <span className="sm:hidden">+</span>
        </button>
      </div>

      {/* Tableau */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
          <svg className="animate-spin h-8 w-8 mb-3 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <p className="text-sm">Chargement des clients...</p>
        </div>
      ) : (
        <DataTable columns={columns} data={clients} totalPages={totalPages} page={page} onPageChange={setPage} />
      )}

      {/* Pipeline */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 sm:p-6">
        <SalesPipeline />
      </div>

      {/* Formulaire modal */}
      {showForm && (
        <ClientFormModal
          client={editingClient}
          onClose={() => setShowForm(false)}
          onSave={handleSave}
        />
      )}

      {/* Confirmation de suppression */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Supprimer le client"
        message={`Supprimer définitivement ${deleteTarget?.name} ?`}
      />
    </div>
  );
}

/* -----------------------------------------------
   Formulaire de création/édition de client (modale)
----------------------------------------------- */
function ClientFormModal({ client, onClose, onSave }) {
  const [form, setForm] = useState({
    name: client?.name || '',
    email: client?.email || '',
    phone: client?.phone || '',
    address: client?.address || '',
    sector: client?.sector || '',
  });
  const [tagsInput, setTagsInput] = useState(client?.tags?.join(', ') || '');

  const handleSubmit = (e) => {
    e.preventDefault();
    const tagsArray = tagsInput.split(',').map((t) => t.trim()).filter(Boolean);
    onSave({ ...form, tags: tagsArray });
  };

  return (
    <FormModal isOpen={true} onClose={onClose} title={client ? 'Modifier le client' : 'Nouveau client'}>
      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div className="sm:col-span-2">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Nom <span className="text-red-500">*</span></label>
            <input id="name" type="text" required value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="block w-full px-3 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
              placeholder="Nom de l'entreprise" />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email <span className="text-red-500">*</span></label>
            <input id="email" type="email" required value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="block w-full px-3 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
              placeholder="contact@acme.com" />
          </div>
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Téléphone <span className="text-red-500">*</span></label>
            <input id="phone" type="text" required value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="block w-full px-3 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
              placeholder="0123456789" />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">Adresse</label>
            <input id="address" type="text" value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              className="block w-full px-3 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
              placeholder="12 rue des Lilas, Paris" />
          </div>
          <div>
            <label htmlFor="sector" className="block text-sm font-medium text-gray-700 mb-1">Secteur</label>
            <input id="sector" type="text" value={form.sector}
              onChange={(e) => setForm({ ...form, sector: e.target.value })}
              className="block w-full px-3 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
              placeholder="IT, SaaS, etc." />
          </div>
          <div>
            <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-1">
              Tags <span className="text-gray-400 font-normal ml-1">(séparés par des virgules)</span>
            </label>
            <input id="tags" type="text" value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              className="block w-full px-3 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
              placeholder="VIP, Premium, ..." />
          </div>
        </div>
        <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-2">
          <button type="button" onClick={onClose} className="w-full sm:w-auto px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors text-sm font-medium">Annuler</button>
          <button type="submit" className="w-full sm:w-auto px-4 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium shadow-sm">Enregistrer</button>
        </div>
      </form>
    </FormModal>
  );
}