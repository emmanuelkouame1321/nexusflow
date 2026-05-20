import { useState, useEffect, useCallback } from 'react';
import api from '../../../services/api';
import {
  DndContext,
  pointerWithin, // ← détection la plus réactive pour le drop
  useSensor,
  useSensors,
  PointerSensor,
  DragOverlay,
  useDroppable,
} from '@dnd-kit/core';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import StatusBadge from '../../../components/shared/StatusBadge';
import FormModal from '../../../components/shared/FormModal';
import { toast } from 'react-toastify';

const STATUSES = ['todo', 'in_progress', 'in_review', 'done'];

export default function ProjectKanbanTab({ projectId }) {
  const [tasks, setTasks] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  // Capteur ultra‑réactif : activation sans distance minimale
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 0 } })
  );

  const fetchTasks = useCallback(async () => {
    try {
      const { data } = await api.get(`/tasks?projectId=${projectId}`);
      const tasksArray = Array.isArray(data) ? data : data.tasks ?? [];
      setTasks(tasksArray);
    } catch (err) {
      console.error('Erreur chargement tâches', err);
      toast.error('Impossible de charger les tâches.');
    }
  }, [projectId]);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  const handleDragEnd = useCallback(
    async (event) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;
      if (!STATUSES.includes(over.id)) return;

      const taskId = active.id;
      const newStatus = over.id;

      setTasks((prev) =>
        prev.map((task) =>
          task.id === taskId ? { ...task, status: newStatus } : task
        )
      );

      try {
        await api.put(`/tasks/${taskId}`, { status: newStatus });
      } catch (err) {
        fetchTasks();
        const message =
          err.response?.data?.message ||
          err.message ||
          'Erreur lors du changement de statut.';
        toast.error(message);
      }
    },
    [fetchTasks]
  );

  const handleSaveTask = useCallback(
    async (formData) => {
      try {
        if (editingTask) {
          await api.put(`/tasks/${editingTask.id}`, formData);
          toast.success('Tâche mise à jour.');
        } else {
          await api.post('/tasks', { ...formData, projectId });
          toast.success('Tâche créée.');
        }
        setShowForm(false);
        setEditingTask(null);
        fetchTasks();
      } catch (err) {
        const message =
          err.response?.data?.message ||
          err.message ||
          "Erreur lors de l'enregistrement.";
        toast.error(message);
      }
    },
    [editingTask, projectId, fetchTasks]
  );

  const getTasksByStatus = useCallback(
    (status) => tasks.filter((t) => t.status === status),
    [tasks]
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Kanban</h3>
        <button
          onClick={() => { setEditingTask(null); setShowForm(true); }}
          className="px-3 py-1.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700"
        >
          + Nouvelle tâche
        </button>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={pointerWithin}
        onDragStart={(e) => setActiveId(e.active.id)}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {STATUSES.map((status) => (
            <KanbanColumn key={status} status={status}>
              {getTasksByStatus(status).map((task) => (
                <SortableTask
                  key={task.id}
                  task={task}
                  onClick={() => { setEditingTask(task); setShowForm(true); }}
                />
              ))}
            </KanbanColumn>
          ))}
        </div>
        <DragOverlay>
          {activeId ? (
            <TaskCard task={tasks.find((t) => t.id === activeId)} />
          ) : null}
        </DragOverlay>
      </DndContext>

      {showForm && (
        <TaskFormModal
          task={editingTask}
          projectId={projectId}
          onClose={() => setShowForm(false)}
          onSave={handleSaveTask}
        />
      )}
    </div>
  );
}

// Colonne avec hauteur fixe et scroll invisible
function KanbanColumn({ status, children }) {
  const { setNodeRef } = useDroppable({ id: status });

  return (
    <div
      ref={setNodeRef}
      className="bg-gray-50 rounded-xl border border-gray-200 p-3 flex flex-col h-60 md:h-64 overflow-hidden"
    >
      <h4 className="font-semibold text-sm mb-2 flex-shrink-0">
        <StatusBadge status={status} size="sm" />
      </h4>
      <div className="flex-1 overflow-y-auto scrollbar-none space-y-2 pr-1">
        {children}
      </div>
    </div>
  );
}

// Carte draggable – réarrangement instantané
function SortableTask({ task, onClick }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    // 0s pendant le drag → réaction immédiate, sinon transition fluide
    transition: isDragging ? '0s' : transition || 'transform 200ms ease',
    opacity: isDragging ? 0.3 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className="bg-white p-2 rounded-lg shadow-sm border border-gray-200 cursor-grab text-sm hover:border-indigo-300 active:cursor-grabbing"
    >
      <div className="font-medium truncate">{task.title}</div>
      {task.assignees?.length > 0 && (
        <div className="text-xs text-gray-500 mt-1">
          {task.assignees.map((a) => a.user?.firstName).join(', ')}
        </div>
      )}
    </div>
  );
}

// Overlay pendant le drag
function TaskCard({ task }) {
  if (!task) return null;
  return (
    <div className="bg-white p-2 rounded-lg shadow-lg border border-indigo-300 text-sm w-48">
      <div className="font-medium">{task.title}</div>
    </div>
  );
}

// Formulaire de création/édition (identique à celui que tu as déjà)
function TaskFormModal({ task, projectId, onClose, onSave }) {
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

  useEffect(() => {
    api.get('/users').then(({ data }) => setUsers(data.users ?? [])).catch(() => {});
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      dueDate: form.dueDate || null,
      estimatedHours: form.estimatedHours ? parseFloat(form.estimatedHours) : null,
    };
    onSave(payload);
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
        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={onClose} className="px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 text-sm">Annuler</button>
          <button type="submit" className="px-4 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-medium">Enregistrer</button>
        </div>
      </form>
    </FormModal>
  );
}