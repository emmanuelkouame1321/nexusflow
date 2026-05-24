import { useState, useEffect } from 'react';
import api from '../../../services/api';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import TaskModal from '../../../components/tasks/TaskModal';
import { toast } from 'react-toastify';

// Configuration de la localisation en français
moment.locale('fr', {
  months: 'janvier_février_mars_avril_mai_juin_juillet_août_septembre_octobre_novembre_décembre'.split('_'),
  monthsShort: 'janv._févr._mars_avr._mai_juin_juil._août_sept._oct._nov._déc.'.split('_'),
  weekdays: 'dimanche_lundi_mardi_mercredi_jeudi_vendredi_samedi'.split('_'),
  weekdaysShort: 'dim._lun._mar._mer._jeu._ven._sam.'.split('_'),
  weekdaysMin: 'Di_Lu_Ma_Me_Je_Ve_Sa'.split('_'),
});

const localizer = momentLocalizer(moment);

export default function ProjectCalendarTab({ projectId }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState(null);
  const [showTaskModal, setShowTaskModal] = useState(false);

  const fetchTasks = async () => {
    try {
      const { data } = await api.get(`/tasks?projectId=${projectId}`);
      const tasks = Array.isArray(data) ? data : data.tasks ?? [];
      // Transformer les tâches avec dueDate en événements du calendrier
      const calendarEvents = tasks
        .filter((task) => task.dueDate)
        .map((task) => ({
          id: task.id,
          title: task.title,
          start: new Date(task.dueDate),
          end: new Date(task.dueDate),
          allDay: true,
          resource: task, // on garde la tâche complète pour l'ouvrir au clic
        }));
      setEvents(calendarEvents);
    } catch (err) {
      toast.error('Erreur lors du chargement des tâches.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [projectId]);

  const handleSelectEvent = (event) => {
    setSelectedTask(event.resource);
    setShowTaskModal(true);
  };

  const handleCloseTaskModal = () => {
    setShowTaskModal(false);
    setSelectedTask(null);
    fetchTasks(); // rafraîchir les tâches après modification éventuelle
  };

  const handleSaveTask = async (formData) => {
    try {
      if (selectedTask) {
        await api.put(`/tasks/${selectedTask.id}`, formData);
        toast.success('Tâche mise à jour.');
      } else {
        await api.post('/tasks', { ...formData, projectId });
        toast.success('Tâche créée.');
      }
      handleCloseTaskModal();
    } catch (err) {
      const message = err.response?.data?.message || "Erreur lors de l'enregistrement.";
      toast.error(message);
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
      <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-100">
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: 600 }}
          views={['month', 'week', 'day']}
          onSelectEvent={handleSelectEvent}
          messages={{
            today: "Aujourd'hui",
            previous: 'Précédent',
            next: 'Suivant',
            month: 'Mois',
            week: 'Semaine',
            day: 'Jour',
            agenda: 'Agenda',
            date: 'Date',
            time: 'Heure',
            event: 'Événement',
          }}
        />
      </div>

      {/* Modal d'édition de la tâche sélectionnée */}
      {showTaskModal && selectedTask && (
        <TaskModal
          task={selectedTask}
          projectId={projectId}
          onClose={handleCloseTaskModal}
          onSave={handleSaveTask}
        />
      )}
    </div>
  );
}