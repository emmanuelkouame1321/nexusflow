import { useState, useEffect, useCallback } from 'react';
import api from '../../../services/api';
import {
  DndContext,
  pointerWithin,
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
import TaskModal from '../../../components/tasks/TaskModal';
import TaskComments from '../../../components/tasks/TaskComments';

const STATUSES = ['todo', 'in_progress', 'in_review', 'done'];

export default function ProjectKanbanTab({ projectId }) {
  const [tasks, setTasks] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [commentTaskId, setCommentTaskId] = useState(null); // ID de la tâche pour les commentaires
  const canCreateTask = useHasRole('admin', 'manager', 'project_manager');
  const canEditTask = useHasRole('admin', 'manager', 'project_manager');
  const canDeleteTask = useHasRole('admin', 'manager');

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
      {canCreateTask && (
        <button
          onClick={() => { setEditingTask(null); setShowForm(true); }}
          className="px-3 py-1.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700"
        >
          + Nouvelle tâche
        </button>
      )}
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
                  onComment={(taskId) => setCommentTaskId(taskId)}
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
        <TaskModal
          task={editingTask}
          projectId={projectId}
          onClose={() => setShowForm(false)}
          onSave={handleSaveTask}
        />
      )}

      {/* Modale des commentaires */}
      {commentTaskId && (
        <FormModal
          isOpen={true}
          onClose={() => setCommentTaskId(null)}
          title="Commentaires de la tâche"
        >
          <TaskComments taskId={commentTaskId} />
        </FormModal>
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

// Carte draggable – réarrangement instantané + boutons d'action
function SortableTask({ task, onClick, onComment }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition: isDragging ? '0s' : transition || 'transform 200ms ease',
    opacity: isDragging ? 0.3 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="bg-white p-2 rounded-lg shadow-sm border border-gray-200 cursor-grab text-sm hover:border-indigo-300 active:cursor-grabbing group"
    >
      <div className="font-medium truncate">{task.title}</div>
      {task.assignees?.length > 0 && (
        <div className="text-xs text-gray-500 mt-1">
          {task.assignees.map((a) => a.user?.firstName).join(', ')}
        </div>
      )}
      {/* Boutons d'action (apparaissent au survol) */}
      <div className="flex gap-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={(e) => { e.stopPropagation(); onClick(); }}
          className="text-xs text-blue-600 hover:text-blue-800"
        >
          Modifier
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onComment(task.id); }}
          className="text-xs text-indigo-600 hover:text-indigo-800"
        >
          Commentaires
        </button>
      </div>
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