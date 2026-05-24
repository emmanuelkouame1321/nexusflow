import { useState, useEffect } from 'react';
import api from '../../services/api';
import DataTable from '../../components/shared/DataTable';
import FormModal from '../../components/shared/FormModal';
import ConfirmDialog from '../../components/shared/ConfirmDialog';
import StatusBadge from '../../components/shared/StatusBadge';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

export default function ProjectsList() {
  const [projects, setProjects] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [users, setUsers] = useState([]); // pour assigner des membres
  const canCreate = useHasRole('admin', 'manager', 'project_manager');
  const canEdit = useHasRole('admin', 'manager', 'project_manager');
  const canDelete = useHasRole('admin');
  const navigate = useNavigate();

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/projects?page=${page}`);
      setProjects(data.projects);
      setTotalPages(data.totalPages);
      setPage(data.page);
    } catch (err) {
      toast.error('Erreur lors du chargement des projets.');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const { data } = await api.get('/users'); // endpoint à créer si nécessaire
      setUsers(data.users || []);
    } catch {
      // les utilisateurs ne sont pas bloquants
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [page]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSave = async (formData) => {
    try {
      if (editingProject) {
        await api.put(`/projects/${editingProject.id}`, formData);
        toast.success('Projet mis à jour.');
      } else {
        await api.post('/projects', formData);
        toast.success('Projet créé.');
      }
      setShowForm(false);
      setEditingProject(null);
      fetchProjects();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur lors de l\'enregistrement.');
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/projects/${deleteTarget.id}`);
      toast.success('Projet supprimé.');
      setDeleteTarget(null);
      fetchProjects();
    } catch (err) {
      toast.error('Erreur lors de la suppression.');
    }
  };

  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'name', label: 'Nom' },
    { key: 'client', label: 'Client', render: (row) => row.client?.name || '—' },
    { key: 'status', label: 'Statut', render: (row) => <StatusBadge status={row.status} size="sm" /> },
    {
      key: 'progress',
      label: 'Progression',
      render: (row) => {
        const progress = row.progress || 0;
        return (
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-indigo-600 h-2 rounded-full" style={{ width: `${progress}%` }}></div>
          </div>
        );
      },
    },
    { key: 'startDate', label: 'Début', render: (row) => row.startDate ? new Date(row.startDate).toLocaleDateString('fr-FR') : '—' },
    { key: 'endDate', label: 'Fin', render: (row) => row.endDate ? new Date(row.endDate).toLocaleDateString('fr-FR') : '—' },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <div className="flex items-center gap-2 whitespace-nowrap">
          <button onClick={() => navigate(`/projects/${row.id}`)} className="text-indigo-600 hover:text-indigo-800 text-xs sm:text-sm font-medium">Voir</button>
          {canEdit && (
          <button onClick={() => { setEditingProject(row); setShowForm(true); }} className="text-blue-600 hover:text-blue-800 text-xs sm:text-sm font-medium">Modifier</button>)}
          {canDelete  && (
          <button onClick={() => setDeleteTarget(row)} className="text-red-600 hover:text-red-800 text-xs sm:text-sm font-medium">Supprimer</button>)}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="sticky top-16 md:top-0 z-20 bg-gray-50 pt-1 pb-3 -mx-4 px-4 sm:mx-0 sm:px-0 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Projets</h2>
        {canCreate &&
        <button
          onClick={() => { setEditingProject(null); setShowForm(true); }}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 shadow-sm transition-colors text-sm sm:text-base self-end sm:self-auto"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          <span className="hidden sm:inline">Nouveau projet</span>
          <span className="sm:hidden">+</span>
        </button>
  }
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
          <svg className="animate-spin h-8 w-8 mb-3 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <p className="text-sm">Chargement des projets...</p>
        </div>
      ) : (
        <DataTable columns={columns} data={projects} totalPages={totalPages} page={page} onPageChange={setPage} />
      )}

      {showForm && (
        <ProjectFormModal
          project={editingProject}
          users={users}
          onClose={() => setShowForm(false)}
          onSave={handleSave}
        />
      )}

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Supprimer le projet"
        message={`Supprimer définitivement ${deleteTarget?.name} ?`}
      />
    </div>
  );
}

function ProjectFormModal({ project, users, onClose, onSave }) {
  const [form, setForm] = useState({
    name: project?.name || '',
    description: project?.description || '',
    clientId: project?.clientId || '',
    startDate: project?.startDate ? project.startDate.slice(0, 10) : '',
    endDate: project?.endDate ? project.endDate.slice(0, 10) : '',
    budget: project?.budget || '',
    memberIds: project?.members?.map((m) => m.userId) || [],
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...form,
      clientId: form.clientId ? parseInt(form.clientId) : null,
      budget: form.budget ? parseFloat(form.budget) : null,
    });
  };

  const toggleMember = (userId) => {
    setForm((prev) => ({
      ...prev,
      memberIds: prev.memberIds.includes(userId)
        ? prev.memberIds.filter((id) => id !== userId)
        : [...prev.memberIds, userId],
    }));
  };

  return (
    <FormModal isOpen={true} onClose={onClose} title={project ? 'Modifier le projet' : 'Nouveau projet'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
          <input id="name" type="text" required value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="block w-full px-3 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" />
        </div>
        <div>
          <label htmlFor="desc" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea id="desc" rows={3} value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="block w-full px-3 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="clientId" className="block text-sm font-medium text-gray-700 mb-1">Client (ID)</label>
            <input id="clientId" type="number" value={form.clientId}
              onChange={(e) => setForm({ ...form, clientId: e.target.value })}
              className="block w-full px-3 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" />
          </div>
          <div>
            <label htmlFor="budget" className="block text-sm font-medium text-gray-700 mb-1">Budget (€)</label>
            <input id="budget" type="number" step="0.01" value={form.budget}
              onChange={(e) => setForm({ ...form, budget: e.target.value })}
              className="block w-full px-3 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" />
          </div>
          <div>
            <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">Début</label>
            <input id="startDate" type="date" value={form.startDate}
              onChange={(e) => setForm({ ...form, startDate: e.target.value })}
              className="block w-full px-3 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" />
          </div>
          <div>
            <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">Fin</label>
            <input id="endDate" type="date" value={form.endDate}
              onChange={(e) => setForm({ ...form, endDate: e.target.value })}
              className="block w-full px-3 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Membres</label>
          <div className="max-h-40 overflow-y-auto grid grid-cols-2 gap-2">
            {users.map((user) => (
              <label key={user.id} className="flex items-center gap-2 p-2 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer text-sm">
                <input type="checkbox" checked={form.memberIds.includes(user.id)}
                  onChange={() => toggleMember(user.id)}
                  className="rounded text-indigo-600 focus:ring-indigo-500" />
                {user.firstName} {user.lastName}
              </label>
            ))}
          </div>
        </div>
        <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-2">
          <button type="button" onClick={onClose} className="w-full sm:w-auto px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 text-sm font-medium">Annuler</button>
          <button type="submit" className="w-full sm:w-auto px-4 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium shadow-sm">Enregistrer</button>
        </div>
      </form>
    </FormModal>
  );
}