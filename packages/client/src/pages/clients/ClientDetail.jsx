import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../services/api';
import StatusBadge from '../../components/shared/StatusBadge';
import DataTable from '../../components/shared/DataTable';
import FormModal from '../../components/shared/FormModal';
import ConfirmDialog from '../../components/shared/ConfirmDialog';

export default function ClientDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [client, setClient] = useState(null);
  const [activeTab, setActiveTab] = useState('info');
  const [quotes, setQuotes] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [projects, setProjects] = useState([]);
  const [showContactForm, setShowContactForm] = useState(false);
  const [editingContact, setEditingContact] = useState(null);
  const [deleteContactTarget, setDeleteContactTarget] = useState(null);

  useEffect(() => {
    const fetchClient = async () => {
      try {
        const { data } = await api.get(`/clients/${id}`);
        setClient(data);
      } catch (err) {
        toast.error('Impossible de charger le client.');
      }
    };
    fetchClient();
  }, [id]);

  useEffect(() => {
    const fetchData = async () => {
      if (activeTab === 'quotes') {
        const { data } = await api.get(`/quotes?clientId=${id}`);
        setQuotes(data.quotes);
      } else if (activeTab === 'invoices') {
        const { data } = await api.get(`/invoices?clientId=${id}`);
        setInvoices(data.invoices);
      } else if (activeTab === 'projects') {
        const { data } = await api.get(`/projects?clientId=${id}`);
        setProjects(data.projects);
      }
    };
    fetchData();
  }, [activeTab, id]);

  if (!client) {
    return (
      <div className="flex justify-center py-10">
        <svg className="animate-spin h-6 w-6 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
        </svg>
      </div>
    );
  }

  const tabs = [
    { key: 'info', label: 'Infos' },
    { key: 'contacts', label: 'Contacts' },
    { key: 'quotes', label: 'Devis' },
    { key: 'invoices', label: 'Factures' },
    { key: 'projects', label: 'Projets' },
  ];

  const handleAddContact = async (formData) => {
    try {
      await api.post(`/clients/${id}/contacts`, formData);
      toast.success('Contact ajouté.');
      setShowContactForm(false);
      const { data } = await api.get(`/clients/${id}`);
      setClient(data);
    } catch (err) {
      toast.error('Erreur lors de l\'ajout du contact.');
    }
  };

  const handleDeleteContact = async () => {
    try {
      await api.delete(`/clients/${id}/contacts/${deleteContactTarget.id}`);
      toast.success('Contact supprimé.');
      setDeleteContactTarget(null);
      const { data } = await api.get(`/clients/${id}`);
      setClient(data);
    } catch (err) {
      toast.error('Erreur lors de la suppression.');
    }
  };

  return (
    <div>
      {/* En-tête sticky */}
      <div className="sticky top-16 md:top-0 z-20 bg-gray-50 pb-3 mb-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/clients')}
            className="inline-flex items-center justify-center w-8 h-8 sm:w-auto sm:h-auto text-indigo-600 hover:text-indigo-800 transition-colors flex-shrink-0"
            aria-label="Retour à la liste des clients"
          >
            <svg className="w-5 h-5 sm:w-4 sm:h-4 sm:mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="hidden sm:inline text-sm">Retour</span>
          </button>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">{client.name}</h2>
        </div>
      </div>

      {/* Onglets */}
      <div className="border-b border-gray-200 mb-4 overflow-x-auto">
        <nav className="flex space-x-3 sm:space-x-6 min-w-max px-1" aria-label="Onglets">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`py-2.5 px-1 text-xs sm:text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                activeTab === tab.key
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Contenu de l'onglet */}
      <div className="space-y-4">
        {activeTab === 'info' && (
          <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-100">
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div><dt className="text-xs font-medium text-gray-500 uppercase">Email</dt><dd className="mt-0.5 text-sm text-gray-900 break-all">{client.email}</dd></div>
              <div><dt className="text-xs font-medium text-gray-500 uppercase">Téléphone</dt><dd className="mt-0.5 text-sm text-gray-900">{client.phone}</dd></div>
              <div><dt className="text-xs font-medium text-gray-500 uppercase">Adresse</dt><dd className="mt-0.5 text-sm text-gray-900">{client.address || '—'}</dd></div>
              <div><dt className="text-xs font-medium text-gray-500 uppercase">Secteur</dt><dd className="mt-0.5 text-sm text-gray-900">{client.sector || '—'}</dd></div>
              <div className="sm:col-span-2">
                <dt className="text-xs font-medium text-gray-500 uppercase mb-1">Tags</dt>
                <dd className="flex flex-wrap gap-1">
                  {client.tags?.length > 0
                    ? client.tags.map((tag) => <span key={tag} className="inline-block bg-indigo-50 text-indigo-700 text-xs font-medium px-2.5 py-1 rounded-full">{tag}</span>)
                    : <span className="text-sm text-gray-400">Aucun</span>}
                </dd>
              </div>
            </dl>
          </div>
        )}

        {activeTab === 'contacts' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Contacts</h3>
              <button onClick={() => { setEditingContact(null); setShowContactForm(true); }}
                className="inline-flex items-center gap-1 px-3 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors shadow-sm">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                <span className="hidden sm:inline">Ajouter</span>
              </button>
            </div>
            {client.contacts?.length === 0 ? (
              <div className="text-center py-10 text-gray-400">
                <svg className="mx-auto h-12 w-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                <p className="mt-2 text-sm">Aucun contact enregistré</p>
              </div>
            ) : (
              <div className="space-y-3">
                {client.contacts?.map((contact) => (
                  <div key={contact.id} className="bg-white border border-gray-100 rounded-xl shadow-sm p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 text-sm sm:text-base flex items-center gap-2">
                        <span className="truncate">{contact.firstName} {contact.lastName}</span>
                        {contact.isPrimary && <span className="inline-block bg-amber-100 text-amber-700 text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0">Principal</span>}
                      </p>
                      <p className="text-sm text-gray-600 truncate">{contact.email}</p>
                      <p className="text-sm text-gray-500">{contact.phone}</p>
                    </div>
                    <div className="flex items-center gap-3 self-end sm:self-center">
                      <button onClick={() => { setEditingContact(contact); setShowContactForm(true); }} className="text-sm text-blue-600 hover:text-blue-800 font-medium px-2 py-1">Modifier</button>
                      <button onClick={() => setDeleteContactTarget(contact)} className="text-sm text-red-600 hover:text-red-800 font-medium px-2 py-1">Supprimer</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'quotes' && (
          <DataTable columns={[
            { key: 'reference', label: 'Réf.' },
            { key: 'totalTTC', label: 'Total TTC' },
            { key: 'status', label: 'Statut', render: (row) => <StatusBadge status={row.status} size="sm" /> },
          ]} data={quotes} />
        )}

        {activeTab === 'invoices' && (
          <DataTable columns={[
            { key: 'reference', label: 'Réf.' },
            { key: 'totalTTC', label: 'Total TTC' },
            { key: 'status', label: 'Statut', render: (row) => <StatusBadge status={row.status} size="sm" /> },
          ]} data={invoices} />
        )}

        {activeTab === 'projects' && (
          <DataTable columns={[
            { key: 'name', label: 'Nom' },
            { key: 'status', label: 'Statut', render: (row) => <StatusBadge status={row.status} size="sm" /> },
            { key: 'startDate', label: 'Début' },
            { key: 'endDate', label: 'Fin' },
          ]} data={projects} />
        )}
      </div>

      {/* Formulaire contact */}
      {showContactForm && (
        <ContactFormModal contact={editingContact} onClose={() => setShowContactForm(false)} onSave={handleAddContact} />
      )}

      {/* Confirmation suppression contact */}
      <ConfirmDialog
        isOpen={!!deleteContactTarget}
        onClose={() => setDeleteContactTarget(null)}
        onConfirm={handleDeleteContact}
        title="Supprimer le contact"
        message={`Supprimer ${deleteContactTarget?.firstName} ${deleteContactTarget?.lastName} ?`}
      />
    </div>
  );
}

/* -----------------------------------------------
   Formulaire de contact (modale)
----------------------------------------------- */
function ContactFormModal({ contact, onClose, onSave }) {
  const [form, setForm] = useState({
    firstName: contact?.firstName || '',
    lastName: contact?.lastName || '',
    email: contact?.email || '',
    phone: contact?.phone || '',
    isPrimary: contact?.isPrimary || false,
  });

  const handleSubmit = (e) => { e.preventDefault(); onSave(form); };

  return (
    <FormModal isOpen={true} onClose={onClose} title={contact ? 'Modifier le contact' : 'Nouveau contact'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">Prénom</label>
            <input id="firstName" type="text" required value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })}
              className="block w-full px-3 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm" />
          </div>
          <div>
            <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
            <input id="lastName" type="text" required value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })}
              className="block w-full px-3 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm" />
          </div>
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input id="email" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="block w-full px-3 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm" />
        </div>
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
          <input id="phone" type="text" required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
            className="block w-full px-3 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm" />
        </div>
        <div className="flex items-center gap-2">
          <input type="checkbox" id="isPrimaryContact" checked={form.isPrimary} onChange={(e) => setForm({ ...form, isPrimary: e.target.checked })} />
          <label htmlFor="isPrimaryContact" className="text-sm font-medium text-gray-700">Contact principal</label>
        </div>
        <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-2">
          <button type="button" onClick={onClose} className="w-full sm:w-auto px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors text-sm font-medium">Annuler</button>
          <button type="submit" className="w-full sm:w-auto px-4 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium shadow-sm">Enregistrer</button>
        </div>
      </form>
    </FormModal>
  );
}