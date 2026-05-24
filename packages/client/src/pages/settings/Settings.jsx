import { useState, useEffect } from 'react';
import api from '../../services/api';
import DataTable from '../../components/shared/DataTable';
import FormModal from '../../components/shared/FormModal';
import ConfirmDialog from '../../components/shared/ConfirmDialog';
import StatusBadge from '../../components/shared/StatusBadge';
import { toast } from 'react-toastify';
import { useHasRole } from '../../hooks/useHasRole';

export default function Settings() {
  const [activeTab, setActiveTab] = useState('users');

  const tabs = [
    { key: 'users', label: 'Utilisateurs' },
    { key: 'roles', label: 'Rôles' },
    { key: 'config', label: 'Configuration' },
  ];

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* En-tête */}
      <div className="sticky top-16 md:top-0 z-20 bg-gray-50 pt-1 pb-3 -mx-4 px-4 sm:mx-0 sm:px-0 border-b border-gray-200">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Paramètres</h2>
        <nav className="flex space-x-4 sm:space-x-6 mt-2 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`py-2 px-1 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
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
      <div>
        {activeTab === 'users' && <UsersTab />}
        {activeTab === 'roles' && <RolesTab />}
        {activeTab === 'config' && <ConfigTab />}
      </div>
    </div>
  );
}

// ----------------------------
// Onglet Utilisateurs
// ----------------------------
function UsersTab() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/users');
      setUsers(data.users || []);
    } catch (err) {
      toast.error('Erreur lors du chargement des utilisateurs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSave = async (formData) => {
    try {
      if (editingUser) {
        await api.put(`/users/${editingUser.id}`, formData);
        toast.success('Utilisateur mis à jour.');
      } else {
        await api.post('/users', formData);
        toast.success('Utilisateur créé.');
      }
      setShowForm(false);
      setEditingUser(null);
      fetchUsers();
    } catch (err) {
      const message = err.response?.data?.message || "Erreur lors de l'enregistrement.";
      toast.error(message);
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/users/${deleteTarget.id}`);
      toast.success('Utilisateur supprimé.');
      setDeleteTarget(null);
      fetchUsers();
    } catch (err) {
      toast.error('Erreur lors de la suppression.');
    }
  };

  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'firstName', label: 'Prénom' },
    { key: 'lastName', label: 'Nom' },
    { key: 'email', label: 'Email' },
    {
      key: 'role',
      label: 'Rôle',
      render: (row) => <StatusBadge status={row.role?.name} />,
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <div className="flex gap-2 whitespace-nowrap">
          <button
            onClick={() => { setEditingUser(row); setShowForm(true); }}
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
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Utilisateurs</h3>
        <button
          onClick={() => { setEditingUser(null); setShowForm(true); }}
          className="px-3 py-1.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700"
        >
          + Nouvel utilisateur
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-10">
          <svg className="animate-spin h-6 w-6 text-indigo-500" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        </div>
      ) : (
        <DataTable columns={columns} data={users} />
      )}

      {showForm && (
        <UserFormModal
          user={editingUser}
          onClose={() => setShowForm(false)}
          onSave={handleSave}
        />
      )}

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Supprimer l'utilisateur"
        message={`Supprimer définitivement ${deleteTarget?.firstName} ${deleteTarget?.lastName} ?`}
      />
    </div>
  );
}

function UserFormModal({ user, onClose, onSave }) {
  const [form, setForm] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    password: '',
    roleId: user?.role?.id || '',
  });
  const [roles, setRoles] = useState([]);

  useEffect(() => {
    api.get('/roles')
      .then(({ data }) => setRoles(data.roles || data))
      .catch(() => {});
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      firstName: form.firstName,
      lastName: form.lastName,
      email: form.email,
      roleId: parseInt(form.roleId),
    };
    if (!user) payload.password = form.password; // uniquement à la création
    onSave(payload);
  };

  return (
    <FormModal isOpen={true} onClose={onClose} title={user ? 'Modifier l’utilisateur' : 'Nouvel utilisateur'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Prénom</label>
            <input type="text" required value={form.firstName}
              onChange={(e) => setForm({ ...form, firstName: e.target.value })}
              className="block w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
            <input type="text" required value={form.lastName}
              onChange={(e) => setForm({ ...form, lastName: e.target.value })}
              className="block w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input type="email" required value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="block w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm" />
        </div>
        {!user && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe</label>
            <input type="password" required value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="block w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm" />
          </div>
        )}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Rôle</label>
          <select value={form.roleId} onChange={(e) => setForm({ ...form, roleId: e.target.value })}
            className="block w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm">
            <option value="">Sélectionner un rôle</option>
            {roles.map((r) => (
              <option key={r.id} value={r.id}>{r.name}</option>
            ))}
          </select>
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={onClose} className="px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 text-sm">Annuler</button>
          <button type="submit" className="px-4 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-medium">Enregistrer</button>
        </div>
      </form>
    </FormModal>
  );
}

// ----------------------------
// Onglet Rôles
// ----------------------------
function RolesTab() {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/roles')
      .then(({ data }) => {
        setRoles(data.roles || data);
        setLoading(false);
      })
      .catch(() => {
        toast.error('Erreur lors du chargement des rôles.');
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <svg className="animate-spin h-6 w-6 text-indigo-500" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Rôles</h3>
      <div className="space-y-3">
        {roles.length === 0 ? (
          <p className="text-sm text-gray-400">Aucun rôle trouvé.</p>
        ) : (
          roles.map((role) => (
            <div key={role.id} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-gray-900 capitalize">{role.name}</h4>
                <span className="text-xs text-gray-400">{role.permissions?.length || 0} permission(s)</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {role.permissions?.map((rp) => (
                  <span key={rp.permissionId} className="inline-block bg-gray-100 text-gray-700 text-xs font-medium px-2 py-0.5 rounded-full">
                    {rp.permission?.name || `#${rp.permissionId}`}
                  </span>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// ----------------------------
// Onglet Configuration
// ----------------------------
function ConfigTab() {
  const [form, setForm] = useState({
    companyName: '',
    companyAddress: '',
    companyEmail: '',
    companyPhone: '',
    logoUrl: '',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data } = await api.get('/settings');
        // data est un objet { companyName: '...', ... }
        setForm({
          companyName: data.companyName || '',
          companyAddress: data.companyAddress || '',
          companyEmail: data.companyEmail || '',
          companyPhone: data.companyPhone || '',
          logoUrl: data.logoUrl || '',
        });
      } catch (err) {
        toast.error('Erreur lors du chargement des paramètres.');
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Mettre à jour chaque champ individuellement
      const entries = Object.entries(form);
      for (const [key, value] of entries) {
        await api.put('/settings', { key, value });
      }
      toast.success('Paramètres mis à jour avec succès.');
    } catch (err) {
      toast.error('Erreur lors de la mise à jour.');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <svg className="animate-spin h-6 w-6 text-indigo-500" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Configuration générale</h3>
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nom de l'entreprise</label>
            <input type="text" value={form.companyName}
              onChange={(e) => setForm({ ...form, companyName: e.target.value })}
              className="block w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email contact</label>
            <input type="email" value={form.companyEmail}
              onChange={(e) => setForm({ ...form, companyEmail: e.target.value })}
              className="block w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
            <input type="text" value={form.companyPhone}
              onChange={(e) => setForm({ ...form, companyPhone: e.target.value })}
              className="block w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Adresse</label>
            <input type="text" value={form.companyAddress}
              onChange={(e) => setForm({ ...form, companyAddress: e.target.value })}
              className="block w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm" />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">URL du logo</label>
            <input type="text" value={form.logoUrl}
              onChange={(e) => setForm({ ...form, logoUrl: e.target.value })}
              className="block w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm"
              placeholder="https://..." />
          </div>
        </div>
        <div className="flex justify-end pt-2">
          <button type="submit" className="px-4 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700">
            Enregistrer les modifications
          </button>
        </div>
      </form>
    </div>
  );
}