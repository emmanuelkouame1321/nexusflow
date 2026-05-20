// ============================================================
// Fichier : packages/client/src/pages/invoices/InvoiceDetail.jsx
// ============================================================
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../services/api';
import StatusBadge from '../../components/shared/StatusBadge';
import DataTable from '../../components/shared/DataTable';
import FormModal from '../../components/shared/FormModal';
import ConfirmDialog from '../../components/shared/ConfirmDialog';

export default function InvoiceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [showRemindModal, setShowRemindModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [paymentForm, setPaymentForm] = useState({ amount: '', method: 'virement', reference: '', date: '' });
// État commun pour la modale d'envoi
  const [sending, setSending] = useState(false);
  const [emailModal, setEmailModal] = useState({
    open: false,
    mode: 'send', // 'send' ou 'remind'
  });
  const [emailInput, setEmailInput] = useState('');
  // Ouvrir la modale pour "Envoyer"
  const openSendModal = () => {
    setEmailInput(invoice.client?.email || '');
    setEmailModal({ open: true, mode: 'send' });
  };
  // Ouvrir la modale pour "Relancer"
  const openRemindModal = () => {
    setEmailInput(invoice.client?.email || '');
    setEmailModal({ open: true, mode: 'remind' });
  };


  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        const { data } = await api.get(`/invoices/${id}`);
        setInvoice(data);
      } catch (err) {
        toast.error('Impossible de charger la facture.');
      } finally {
        setLoading(false);
      }
    };
    fetchInvoice();
  }, [id]);

    // Pré-remplir la référence du paiement avec le numéro de la facture
    useEffect(() => {
      if (invoice) {
        setPaymentForm((prev) => ({ ...prev, reference: invoice.reference }));
      }
    }, [invoice]);

  const handleAddPayment = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/invoices/${invoice.id}/payments`, {
        amount: parseFloat(paymentForm.amount),
        method: paymentForm.method,
        reference: paymentForm.reference || null,
        date: paymentForm.date || undefined,
      });
      toast.success('Paiement enregistré.');
      setShowPaymentForm(false);
      setPaymentForm({ amount: '', method: 'virement', reference: '', date: '' });
      const { data } = await api.get(`/invoices/${id}`);
      setInvoice(data);
    } catch (err) {
      toast.error('paiement non enregistré.');
    }
  };


// Action exécutée quand l'utilisateur clique sur le bouton d'envoi dans la modale
const handleSendOrRemind = async () => {
  const to = emailInput;
  if (!to) {
    toast.error('Veuillez entrer une adresse email.');
    return;
  }
  setSending(true);
  try {
    if (emailModal.mode === 'remind') {
      await api.post(`/invoices/${invoice.id}/remind`, { email: to });
      toast.success('Relance envoyée.');
    } else {
      await api.post(`/invoices/${invoice.id}/send`, { email: to });
      toast.success('Facture envoyée par email.');
    }
    // Recharger la facture
    const { data } = await api.get(`/invoices/${id}`);
    setInvoice(data);
    setEmailModal({ open: false, mode: 'send' });
  } catch (err) {
    toast.error('Erreur lors de l\'envoi.');
  } finally {
    setSending(false);
  }
};

  const handleDownloadPDF = () => {
    window.open(`/api/v1/invoices/${invoice.id}/pdf`, '_blank');
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/invoices/${invoice.id}`);
      toast.success('Facture supprimée.');
      navigate('/invoices');
    } catch (err) {
      toast.error('Erreur lors de la suppression.');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <svg className="animate-spin h-6 w-6 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
        </svg>
      </div>
    );
  }

  if (!invoice) {
    return <div className="text-center py-10 text-red-500">Facture introuvable.</div>;
  }

  const totalPaid = invoice.payments?.reduce((sum, p) => sum + p.amount, 0) || 0;
  const balance = invoice.totalTTC - totalPaid;

  const itemColumns = [
    { key: 'description', label: 'Description' },
    { key: 'quantity', label: 'Qté' },
    { key: 'unitPrice', label: 'Prix unitaire', render: (row) => `${row.unitPrice} €` },
    { key: 'discount', label: 'Remise', render: (row) => `${row.discount}%` },
    { key: 'taxRate', label: 'Taxe', render: (row) => `${row.taxRate}%` },
  ];

  const paymentColumns = [
    { key: 'date', label: 'Date', render: (row) => new Date(row.date).toLocaleDateString('fr-FR') },
    { key: 'method', label: 'Méthode' },
    { key: 'amount', label: 'Montant', render: (row) => `${row.amount?.toFixed(2)} €` },
    { key: 'reference', label: 'Référence', render: (row) => row.reference || '—' },
  ];

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* En-tête sticky */}
      <div className="sticky top-16 md:top-0 z-20 bg-gray-50 pt-1 pb-3 -mx-4 px-4 sm:mx-0 sm:px-0 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/invoices')}
            className="inline-flex items-center justify-center w-8 h-8 sm:w-auto sm:h-auto text-indigo-600 hover:text-indigo-800 transition-colors flex-shrink-0"
            aria-label="Retour à la liste des factures"
          >
            <svg className="w-5 h-5 sm:w-4 sm:h-4 sm:mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="hidden sm:inline text-sm">Retour</span>
          </button>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">{invoice.reference}</h2>
          <StatusBadge status={invoice.status} size="sm" />
        </div>
        <div className="flex flex-wrap gap-2 mt-2 sm:mt-0">
          <button onClick={() => setShowPaymentForm(true)} className="px-3 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors shadow-sm">
            Ajouter un paiement
        </button>
          <button onClick={openSendModal} disabled={sending}
            className="px-3 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50">
            Envoyer par email
          </button>
          <button onClick={openRemindModal}
            className="px-3 py-2 bg-orange-600 text-white text-sm font-medium rounded-lg hover:bg-orange-700">
            Relancer
          </button>
          {emailModal.open && (
            <FormModal
              isOpen={true}
              onClose={() => setEmailModal({ ...emailModal, open: false })}
              title={emailModal.mode === 'remind' ? 'Relancer par email' : 'Envoyer la facture par email'}
            >
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  {emailModal.mode === 'remind'
                    ? `Relance pour la facture ${invoice.reference}.`
                    : `Envoyer la facture ${invoice.reference} au destinataire suivant :`}
                </p>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Adresse email</label>
                  <input
                    type="email"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    placeholder="email@exemple.com"
                    className="block w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm"
                  />
                </div>
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setEmailModal({ ...emailModal, open: false })}
                    className="px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 text-sm font-medium"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleSendOrRemind}
                    disabled={sending}
                    className={`px-4 py-2.5 text-white rounded-lg text-sm font-medium ${
                      emailModal.mode === 'remind' ? 'bg-orange-600 hover:bg-orange-700' : 'bg-indigo-600 hover:bg-indigo-700'
                    } disabled:opacity-50`}
                  >
                    {sending ? 'Envoi...' : emailModal.mode === 'remind' ? 'Envoyer la relance' : 'Envoyer'}
                  </button>
                </div>
              </div>
            </FormModal>
          )}
          <button onClick={handleDownloadPDF} className="px-3 py-2 bg-gray-600 text-white text-sm font-medium rounded-lg hover:bg-gray-700 transition-colors shadow-sm">
            PDF
          </button>
          <button onClick={() => setShowDeleteConfirm(true)} className="px-3 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors shadow-sm">
            Supprimer
          </button>
        </div>
      </div>

      {/* Informations et solde */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <p className="text-xs font-medium text-gray-500 uppercase">Client</p>
          <p className="text-sm text-gray-900 mt-1">{invoice.client?.name || 'N/A'}</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <p className="text-xs font-medium text-gray-500 uppercase">Échéance</p>
          <p className="text-sm text-gray-900 mt-1">{invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString('fr-FR') : 'N/A'}</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <p className="text-xs font-medium text-gray-500 uppercase">Total TTC</p>
          <p className="text-lg font-bold text-indigo-600">{invoice.totalTTC?.toFixed(2)} €</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <p className="text-xs font-medium text-gray-500 uppercase">Solde dû</p>
          <p className={`text-lg font-bold ${balance > 0 ? 'text-red-600' : 'text-green-600'}`}>
            {balance > 0 ? `${balance.toFixed(2)} €` : 'Payée'}
          </p>
        </div>
      </div>

      {/* Lignes de la facture */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-3">Articles</h3>
        <DataTable columns={itemColumns} data={invoice.items} />
      </div>

      {/* Paiements */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-3">Paiements</h3>
        {invoice.payments?.length === 0 ? (
          <p className="text-sm text-gray-400">Aucun paiement enregistré.</p>
        ) : (
          <DataTable columns={paymentColumns} data={invoice.payments} />
        )}
      </div>

      {/* Modale ajout de paiement */}
      {showPaymentForm && (
        <FormModal isOpen={true} onClose={() => setShowPaymentForm(false)} title="Nouveau paiement">
          <form onSubmit={handleAddPayment} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Montant (€)</label>
              <input type="number" step="0.01" required value={paymentForm.amount}
                onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                className="block w-full px-3 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Méthode</label>
              <select value={paymentForm.method}
                onChange={(e) => setPaymentForm({ ...paymentForm, method: e.target.value })}
                className="block w-full px-3 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm">
                <option value="virement">Virement</option>
                <option value="carte">Carte bancaire</option>
                <option value="espèces">Espèces</option>
                <option value="chèque">Chèque</option>
                <option value="autre">Autre</option>
              </select>
            </div>
            <div>
              <label htmlFor="paymentRef" className="block text-sm font-medium text-gray-700 mb-1">
                Référence <span className="text-red-500">*</span>
              </label>
              <input
                id="paymentRef"
                type="text"
                required
                readOnly
                value={paymentForm.reference}
                className="block w-full px-3 py-2.5 border border-gray-300 rounded-lg shadow-sm bg-gray-100 text-gray-500 cursor-not-allowed focus:outline-none text-sm"
              />
              <p className="text-xs text-gray-400 mt-1">Référence générée automatiquement depuis la facture.</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date (optionnel)</label>
              <input type="date" value={paymentForm.date}
                onChange={(e) => setPaymentForm({ ...paymentForm, date: e.target.value })}
                className="block w-full px-3 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" />
            </div>
            <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-2">
              <button type="button" onClick={() => setShowPaymentForm(false)}
                className="w-full sm:w-auto px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 text-sm font-medium">Annuler</button>
              <button type="submit"
                className="w-full sm:w-auto px-4 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium shadow-sm">Enregistrer</button>
            </div>
          </form>
        </FormModal>
      )}

      {/* Modale relance */}
      {showRemindModal && (
        <FormModal isOpen={true} onClose={() => setShowRemindModal(false)} title="Relancer par email">
          <div className="space-y-4">
            <p className="text-sm text-gray-600">Envoyer une relance pour la facture {invoice.reference}.</p>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Adresse email</label>
              <input type="email" value={remindEmail}
                onChange={(e) => setRemindEmail(e.target.value)}
                placeholder={invoice.client?.email || 'email@exemple.com'}
                className="block w-full px-3 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" />
              <p className="text-xs text-gray-400 mt-1">Laissez vide pour utiliser l'email du client.</p>
            </div>
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowRemindModal(false)} className="px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 text-sm font-medium">Annuler</button>
              <button onClick={handleRemind} disabled={sending} className="px-4 py-2.5 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 text-sm font-medium">
                {sending ? 'Envoi...' : 'Envoyer la relance'}
              </button>
            </div>
          </div>
        </FormModal>
      )}

      {/* Confirmation suppression */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Supprimer la facture"
        message={`Supprimer définitivement la facture ${invoice.reference} ?`}
      />
    </div>
  );
}