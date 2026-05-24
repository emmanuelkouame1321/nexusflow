import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../services/api';
import StatusBadge from '../../components/shared/StatusBadge';
import DataTable from '../../components/shared/DataTable';
import FormModal from '../../components/shared/FormModal';
import ConfirmDialog from '../../components/shared/ConfirmDialog';
import { useHasRole } from '../../hooks/useHasRole'; // ← ajouté

export default function QuoteDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quote, setQuote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailInput, setEmailInput] = useState('');
  const [sending, setSending] = useState(false);
  const [converting, setConverting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Vérification des rôles
  const canSend = useHasRole('admin', 'manager', 'commercial');
  const canConvert = useHasRole('admin', 'manager', 'commercial');
  const canDelete = useHasRole('admin');

  useEffect(() => {
    const fetchQuote = async () => {
      try {
        const { data } = await api.get(`/quotes/${id}`);
        setQuote(data);
      } catch (err) {
        toast.error('Impossible de charger le devis.');
      } finally {
        setLoading(false);
      }
    };
    fetchQuote();
  }, [id]);

  const handleSendEmail = async () => {
    const to = emailInput || quote.client?.email;
    if (!to) {
      toast.error('Aucune adresse email disponible.');
      return;
    }
    setSending(true);
    try {
      await api.post(`/quotes/${quote.id}/send`, { email: to });
      toast.success('Email envoyé avec succès.');
      setShowEmailModal(false);
    } catch (err) {
      toast.error("Erreur lors de l'envoi de l'email.");
    } finally {
      setSending(false);
    }
  };

  const handleDownloadPDF = () => {
    window.open(`/api/v1/quotes/${quote.id}/pdf`, '_blank');
  };

  const handleConvertToInvoice = async () => {
    if (!quote.client?.email) {
      toast.error("Le client n'a pas d'adresse email. Veuillez renseigner un email pour ce client avant de convertir.");
      return;
    }

    setConverting(true);
    try {
      const { data: invoice } = await api.post('/invoices', {
        clientId: quote.clientId,
        quoteId: quote.id,
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        items: quote.items.map((item) => ({
          description: item.description || '',
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          discount: item.discount,
          taxRate: item.taxRate,
          productId: item.productId,
        })),
      });
      toast.success(`Facture ${invoice.reference} créée avec succès.`);
      navigate(`/invoices/${invoice.id}`);
    } catch (err) {
      toast.error('Erreur lors de la conversion en facture.');
    } finally {
      setConverting(false);
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/quotes/${quote.id}`);
      toast.success('Devis supprimé.');
      navigate('/quotes');
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

  if (!quote) {
    return <div className="text-center py-10 text-red-500">Devis introuvable.</div>;
  }

  const columns = [
    { key: 'description', label: 'Description' },
    { key: 'quantity', label: 'Qté' },
    { key: 'unitPrice', label: 'Prix unitaire', render: (row) => `${row.unitPrice} €` },
    { key: 'discount', label: 'Remise', render: (row) => `${row.discount}%` },
    { key: 'taxRate', label: 'Taxe', render: (row) => `${row.taxRate}%` },
    {
      key: 'lineTotal',
      label: 'Total ligne',
      render: (row) => {
        const lineHT = row.quantity * row.unitPrice * (1 - row.discount / 100);
        const lineTTC = lineHT * (1 + row.taxRate / 100);
        return `${lineTTC.toFixed(2)} €`;
      },
    },
  ];

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* En-tête sticky */}
      <div className="sticky top-16 md:top-0 z-20 bg-gray-50 pt-1 pb-3 -mx-4 px-4 sm:mx-0 sm:px-0 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/quotes')}
            className="inline-flex items-center justify-center w-8 h-8 sm:w-auto sm:h-auto text-indigo-600 hover:text-indigo-800 transition-colors flex-shrink-0"
            aria-label="Retour à la liste des devis"
          >
            <svg className="w-5 h-5 sm:w-4 sm:h-4 sm:mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="hidden sm:inline text-sm">Retour</span>
          </button>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">{quote.reference}</h2>
          <StatusBadge status={quote.status} size="sm" />
        </div>
        <div className="flex flex-wrap gap-2 self-end sm:self-auto">
          {canSend && (
            <button onClick={() => setShowEmailModal(true)} className="px-3 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors shadow-sm">
              Envoyer par email
            </button>
          )}
          <button onClick={handleDownloadPDF} className="px-3 py-2 bg-gray-600 text-white text-sm font-medium rounded-lg hover:bg-gray-700 transition-colors shadow-sm">
            Télécharger PDF
          </button>
          {canConvert && (
            <button onClick={handleConvertToInvoice} disabled={converting} className="px-3 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors shadow-sm">
              {converting ? 'Conversion...' : 'Convertir en facture'}
            </button>
          )}
          {canDelete && (
            <button onClick={() => setShowDeleteConfirm(true)} className="px-3 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors shadow-sm">
              Supprimer
            </button>
          )}
        </div>
      </div>

      {/* Informations générales */}
      <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div><span className="text-xs font-medium text-gray-500 uppercase">Client</span><p className="text-sm text-gray-900 mt-1">{quote.client?.name || 'N/A'}</p></div>
          <div><span className="text-xs font-medium text-gray-500 uppercase">Email client</span><p className="text-sm text-gray-900 mt-1">{quote.client?.email || 'N/A'}</p></div>
          <div><span className="text-xs font-medium text-gray-500 uppercase">Créé le</span><p className="text-sm text-gray-900 mt-1">{new Date(quote.createdAt).toLocaleDateString('fr-FR')}</p></div>
          <div><span className="text-xs font-medium text-gray-500 uppercase">Validité</span><p className="text-sm text-gray-900 mt-1">{quote.validUntil ? new Date(quote.validUntil).toLocaleDateString('fr-FR') : 'N/A'}</p></div>
          <div className="sm:col-span-2 flex flex-wrap gap-4">
            <div><span className="text-xs font-medium text-gray-500 uppercase">Total HT</span><p className="text-lg font-bold text-gray-900">{quote.totalHT?.toFixed(2)} €</p></div>
            <div><span className="text-xs font-medium text-gray-500 uppercase">Total TTC</span><p className="text-lg font-bold text-indigo-600">{quote.totalTTC?.toFixed(2)} €</p></div>
          </div>
        </div>
      </div>

      {/* Lignes d'articles */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-3">Lignes d'articles</h3>
        <DataTable columns={columns} data={quote.items} />
      </div>

      {/* Modal email */}
      {showEmailModal && (
        <FormModal isOpen={true} onClose={() => setShowEmailModal(false)} title="Envoyer le devis par email">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Adresse email</label>
              <input type="email" value={emailInput} onChange={(e) => setEmailInput(e.target.value)} placeholder={quote.client?.email || 'email@exemple.com'} className="block w-full px-3 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" />
              <p className="text-xs text-gray-400 mt-1">Laissez vide pour utiliser l'email du client.</p>
            </div>
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowEmailModal(false)} className="px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 text-sm font-medium">Annuler</button>
              <button onClick={handleSendEmail} disabled={sending} className="px-4 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 text-sm font-medium">{sending ? 'Envoi...' : 'Envoyer'}</button>
            </div>
          </div>
        </FormModal>
      )}

      {/* Confirmation suppression */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Supprimer le devis"
        message={`Supprimer définitivement le devis ${quote.reference} ?`}
      />
    </div>
  );
}