import { useState, useEffect } from 'react';
import api from '../../services/api';
import DataTable from '../../components/shared/DataTable';
import FormModal from '../../components/shared/FormModal';
import ConfirmDialog from '../../components/shared/ConfirmDialog';
import { toast } from 'react-toastify';

export default function ProductsList() {
  const [products, setProducts] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/products?page=${page}`);
      // L'API renvoie un tableau simple (sans pagination ? Adapter selon la réalité)
      // Si l'API ne pagine pas, on peut retirer la logique de pagination
      setProducts(Array.isArray(data) ? data : data.products || []);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      toast.error('Erreur lors du chargement des produits.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [page]);

  const handleSave = async (formData) => {
    try {
      if (editingProduct) {
        await api.put(`/products/${editingProduct.id}`, formData);
        toast.success('Produit mis à jour avec succès.');
      } else {
        await api.post('/products', formData);
        toast.success('Produit créé avec succès.');
      }
      setShowForm(false);
      setEditingProduct(null);
      fetchProducts();
    } catch (err) {
      const message = err.response?.data?.message || 'Erreur lors de l\'enregistrement.';
      toast.error(message);
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/products/${deleteTarget.id}`);
      toast.success('Produit supprimé.');
      setDeleteTarget(null);
      fetchProducts();
    } catch (err) {
      toast.error('Erreur lors de la suppression.');
      setDeleteTarget(null);
    }
  };

  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'name', label: 'Nom' },
    { key: 'description', label: 'Description', render: (row) => row.description || '—' },
    { key: 'unitPrice', label: 'Prix unitaire', render: (row) => `${row.unitPrice} €` },
    { key: 'taxRate', label: 'TVA', render: (row) => `${row.taxRate}%` },
    { key: 'unit', label: 'Unité' },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <div className="flex items-center gap-2 whitespace-nowrap">
          <button
            onClick={() => { setEditingProduct(row); setShowForm(true); }}
            className="text-blue-600 hover:text-blue-800 text-xs sm:text-sm font-medium"
          >
            Modifier
          </button>
          <button
            onClick={() => setDeleteTarget(row)}
            className="text-red-600 hover:text-red-800 text-xs sm:text-sm font-medium"
          >
            Supprimer
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* En-tête */}
      <div className="sticky top-16 md:top-0 z-20 bg-gray-50 pt-1 pb-3 -mx-4 px-4 sm:mx-0 sm:px-0 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Produits</h2>
        <button
          onClick={() => { setEditingProduct(null); setShowForm(true); }}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 shadow-sm transition-colors text-sm sm:text-base self-end sm:self-auto"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          <span className="hidden sm:inline">Nouveau produit</span>
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
          <p className="text-sm">Chargement des produits...</p>
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={products}
          totalPages={totalPages}
          page={page}
          onPageChange={setPage}
        />
      )}

      {/* Modal formulaire */}
      {showForm && (
        <ProductFormModal
          product={editingProduct}
          onClose={() => setShowForm(false)}
          onSave={handleSave}
        />
      )}

      {/* Confirmation suppression */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Supprimer le produit"
        message={`Supprimer définitivement ${deleteTarget?.name} ?`}
      />
    </div>
  );
}

function ProductFormModal({ product, onClose, onSave }) {
  const [form, setForm] = useState({
    name: product?.name || '',
    description: product?.description || '',
    unitPrice: product?.unitPrice || '',
    taxRate: product?.taxRate ?? 0,
    unit: product?.unit || 'unité',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...form,
      unitPrice: parseFloat(form.unitPrice),
      taxRate: parseFloat(form.taxRate),
    });
  };

  return (
    <FormModal isOpen={true} onClose={onClose} title={product ? 'Modifier le produit' : 'Nouveau produit'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
          <input id="name" type="text" required value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="block w-full px-3 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" />
        </div>
        <div>
          <label htmlFor="desc" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea id="desc" rows={2} value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="block w-full px-3 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">Prix unitaire (€)</label>
            <input id="price" type="number" step="0.01" required value={form.unitPrice}
              onChange={(e) => setForm({ ...form, unitPrice: e.target.value })}
              className="block w-full px-3 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" />
          </div>
          <div>
            <label htmlFor="tax" className="block text-sm font-medium text-gray-700 mb-1">TVA (%)</label>
            <input id="tax" type="number" step="0.01" value={form.taxRate}
              onChange={(e) => setForm({ ...form, taxRate: e.target.value })}
              className="block w-full px-3 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" />
          </div>
          <div>
            <label htmlFor="unit" className="block text-sm font-medium text-gray-700 mb-1">Unité</label>
            <input id="unit" type="text" value={form.unit}
              onChange={(e) => setForm({ ...form, unit: e.target.value })}
              className="block w-full px-3 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" />
          </div>
        </div>
        <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-2">
          <button type="button" onClick={onClose}
            className="w-full sm:w-auto px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 text-sm font-medium">Annuler</button>
          <button type="submit"
            className="w-full sm:w-auto px-4 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium shadow-sm">Enregistrer</button>
        </div>
      </form>
    </FormModal>
  );
}