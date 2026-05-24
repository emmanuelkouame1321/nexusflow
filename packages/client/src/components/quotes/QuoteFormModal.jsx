import { useState, useEffect } from 'react';
import api from '../../services/api';
import FormModal from '../shared/FormModal';
import { toast } from 'react-toastify';

export default function QuoteFormModal({ onClose, onSave }) {
  const [clients, setClients] = useState([]);
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({
    clientId: '',
    validUntil: '',
    items: [{ productId: '', description: '', quantity: 1, unitPrice: 0, discount: 0, taxRate: 0 }],
  });

  useEffect(() => {
    api.get('/clients?limit=100').then(({ data }) => setClients(data.clients || [])).catch(() => {});
    api.get('/products').then(({ data }) => setProducts(Array.isArray(data) ? data : data.products || [])).catch(() => {});
  }, []);

  const addItem = () => {
    setForm((prev) => ({
      ...prev,
      items: [...prev.items, { productId: '', description: '', quantity: 1, unitPrice: 0, discount: 0, taxRate: 0 }],
    }));
  };

  const removeItem = (index) => {
    setForm((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  const updateItem = (index, field, value) => {
    setForm((prev) => {
      const items = [...prev.items];
      items[index] = { ...items[index], [field]: value };

      // Si on change le produit, auto-remplir description, prix, taxe
      if (field === 'productId') {
        const product = products.find((p) => p.id === parseInt(value));
        if (product) {
          items[index].description = product.description || '';
          items[index].unitPrice = product.unitPrice;
          items[index].taxRate = product.taxRate;
        }
      }

      return { ...prev, items };
    });
  };

    const handleSubmit = (e) => {
      e.preventDefault();
      const payload = {
        clientId: parseInt(form.clientId),
        validUntil: form.validUntil || new Date().toISOString().split('T')[0], // ← date courante par défaut
        items: form.items.map((item) => ({
          productId: item.productId ? parseInt(item.productId) : null,
          description: item.description,
          quantity: parseInt(item.quantity),
          unitPrice: parseFloat(item.unitPrice),
          discount: parseFloat(item.discount) || 0,
          taxRate: parseFloat(item.taxRate) || 0,
        })),
      };
      onSave(payload);
    };

  return (
    <FormModal isOpen={true} onClose={onClose} title="Nouveau devis">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Client</label>
            <select
              value={form.clientId}
              onChange={(e) => setForm({ ...form, clientId: e.target.value })}
              required
              className="block w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm"
            >
              <option value="">Sélectionner un client</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Validité</label>
            <input
              type="date"
              value={form.validUntil}
              onChange={(e) => setForm({ ...form, validUntil: e.target.value })}
              className="block w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm"
            />
          </div>
        </div>

        {/* Lignes d'articles */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <h4 className="text-sm font-medium text-gray-700">Articles</h4>
            <button type="button" onClick={addItem} className="text-indigo-600 text-sm hover:text-indigo-800">+ Ajouter une ligne</button>
          </div>
          <div className="space-y-3 max-h-60 overflow-y-auto scrollbar-none pr-1">
            {form.items.map((item, index) => (
              <div key={index} className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <div>
                    <label className="text-gray-500">Produit</label>
                    <select
                      value={item.productId}
                      onChange={(e) => updateItem(index, 'productId', e.target.value)}
                      className="block w-full mt-1 px-2 py-1.5 border border-gray-300 rounded text-xs"
                    >
                      <option value="">Manuel</option>
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-gray-500">Description</label>
                    <input type="text" value={item.description} onChange={(e) => updateItem(index, 'description', e.target.value)}
                      className="block w-full mt-1 px-2 py-1.5 border border-gray-300 rounded text-xs" />
                  </div>
                  <div>
                    <label className="text-gray-500">Qté</label>
                    <input type="number" min="1" value={item.quantity} onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                      className="block w-full mt-1 px-2 py-1.5 border border-gray-300 rounded text-xs" />
                  </div>
                  <div>
                    <label className="text-gray-500">Prix unit.</label>
                    <input type="number" step="0.01" value={item.unitPrice} onChange={(e) => updateItem(index, 'unitPrice', e.target.value)}
                      className="block w-full mt-1 px-2 py-1.5 border border-gray-300 rounded text-xs" />
                  </div>
                  <div>
                    <label className="text-gray-500">Remise %</label>
                    <input type="number" step="0.01" value={item.discount} onChange={(e) => updateItem(index, 'discount', e.target.value)}
                      className="block w-full mt-1 px-2 py-1.5 border border-gray-300 rounded text-xs" />
                  </div>
                  <div>
                    <label className="text-gray-500">Taxe %</label>
                    <input type="number" step="0.01" value={item.taxRate} onChange={(e) => updateItem(index, 'taxRate', e.target.value)}
                      className="block w-full mt-1 px-2 py-1.5 border border-gray-300 rounded text-xs" />
                  </div>
                  <div className="flex items-end">
                    <button type="button" onClick={() => removeItem(index)} className="text-red-500 hover:text-red-700 text-xs mt-2">Suppr.</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={onClose} className="px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 text-sm">Annuler</button>
          <button type="submit" className="px-4 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-medium">Créer le devis</button>
        </div>
      </form>
    </FormModal>
  );
}