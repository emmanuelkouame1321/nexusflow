import { useState, useEffect } from 'react';
import api from '../../services/api';
import FormModal from '../shared/FormModal';
import { toast } from 'react-toastify';

export default function TaskModal({ task, projectId, onClose, onSave }) {
  const [form, setForm] = useState({
    title: task?.title || '',
    description: task?.description || '',
    priority: task?.priority || 'medium',
    status: task?.status || 'todo',
    dueDate: task?.dueDate ? task.dueDate.slice(0, 10) : '',
    estimatedHours: task?.estimatedHours || '',
    assigneeIds: task?.assignees?.map((a) => a.userId) || [],
  });
  const [users, setUsers] = useState([]);
  const [allTasks, setAllTasks] = useState([]);
  const [dependencies, setDependencies] = useState(
    task?.dependencies?.map((d) => d.dependsOnTaskId) || []
  );

  useEffect(() => {
    api.get('/users')
      .then(({ data }) => setUsers(data.users ?? []))
      .catch(() => {});
    api.get(`/tasks?projectId=${projectId}`)
      .then(({ data }) => {
        const tasksArray = Array.isArray(data) ? data : data.tasks ?? [];
        setAllTasks(task ? tasksArray.filter((t) => t.id !== task.id) : tasksArray);
      })
      .catch(() => {});
  }, [projectId, task]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      dueDate: form.dueDate || null,
      estimatedHours: form.estimatedHours ? parseFloat(form.estimatedHours) : null,
    };
    onSave(payload);
  };

  const addDependency = async (depTaskId) => {
    if (!task) {
      toast.warning('Veuillez d’abord créer la tâche avant d’ajouter des dépendances.');
      return;
    }
    try {
      await api.post(`/tasks/${task.id}/dependencies`, { dependsOnTaskId: depTaskId });
      setDependencies((prev) => [...prev, depTaskId]);
      toast.success('Dépendance ajoutée.');
    } catch (err) {
      toast.error('Erreur lors de l’ajout de la dépendance.');
    }
  };

  const removeDependency = async (depTaskId) => {
    try {
      const dep = task.dependencies.find((d) => d.dependsOnTaskId === depTaskId);
      if (dep) {
        await api.delete(`/tasks/${task.id}/dependencies/${dep.id}`);
        setDependencies((prev) => prev.filter((id) => id !== depTaskId));
        toast.success('Dépendance supprimée.');
      }
    } catch (err) {
      toast.error('Erreur lors de la suppression de la dépendance.');
    }
  };

  return (
    <FormModal isOpen={true} onClose={onClose} title={task ? 'Modifier la tâche' : 'Nouvelle tâche'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Titre</label>
          <input type="text" required value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="block w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea rows={2} value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="block w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}
              className="block w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm">
              <option value="todo">À faire</option>
              <option value="in_progress">En cours</option>
              <option value="in_review">En révision</option>
              <option value="done">Terminé</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Priorité</label>
            <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}
              className="block w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm">
              <option value="low">Basse</option>
              <option value="medium">Moyenne</option>
              <option value="high">Haute</option>
              <option value="urgent">Urgente</option>
            </select>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Échéance</label>
          <input type="date" value={form.dueDate}
            onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
            className="block w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Heures estimées</label>
          <input type="number" step="0.5" value={form.estimatedHours}
            onChange={(e) => setForm({ ...form, estimatedHours: e.target.value })}
            className="block w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Assignés</label>
          <div className="max-h-32 overflow-y-auto space-y-1">
            {users.map((user) => (
              <label key={user.id} className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={form.assigneeIds.includes(user.id)}
                  onChange={() => setForm((prev) => ({
                    ...prev,
                    assigneeIds: prev.assigneeIds.includes(user.id)
                      ? prev.assigneeIds.filter((id) => id !== user.id)
                      : [...prev.assigneeIds, user.id],
                  }))}
                  className="rounded text-indigo-600" />
                {user.firstName} {user.lastName}
              </label>
            ))}
          </div>
        </div>

        {/* Dépendances (affichées seulement si la tâche existe déjà) */}
        {task && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Dépendances</label>
            <div className="flex flex-wrap gap-1 mb-2">
              {dependencies.map((depTaskId) => {
                const depTask = allTasks.find((t) => t.id === depTaskId);
                return (
                  <span key={depTaskId} className="inline-flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-full text-xs">
                    {depTask?.title || `Tâche #${depTaskId}`}
                    <button
                      type="button"
                      onClick={() => removeDependency(depTaskId)}
                      className="text-red-500 hover:text-red-700"
                    >
                      ×
                    </button>
                  </span>
                );
              })}
            </div>
            <select
              onChange={(e) => {
                if (e.target.value) addDependency(parseInt(e.target.value));
                e.target.value = '';
              }}
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              defaultValue=""
            >
              <option value="" disabled>Ajouter une dépendance...</option>
              {allTasks
                .filter((t) => !dependencies.includes(t.id))
                .map((t) => (
                  <option key={t.id} value={t.id}>{t.title}</option>
                ))}
            </select>
          </div>
        )}

        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={onClose} className="px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 text-sm">Annuler</button>
          <button type="submit" className="px-4 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-medium">Enregistrer</button>
        </div>
      </form>
    </FormModal>
  );
}