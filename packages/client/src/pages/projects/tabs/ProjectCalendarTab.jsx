import { useState, useEffect } from 'react';
import api from '../../../services/api';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const localizer = momentLocalizer(moment);

export default function ProjectCalendarTab({ projectId }) {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const { data } = await api.get(`/tasks?projectId=${projectId}`);
        const tasks = data.tasks || data || [];
        setEvents(tasks.filter((t) => t.dueDate).map((t) => ({
          title: t.title,
          start: new Date(t.dueDate),
          end: new Date(t.dueDate),
          allDay: true,
        })));
      } catch (err) {
        console.error(err);
      }
    };
    fetchTasks();
  }, [projectId]);

  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 500 }}
        views={['month']}
      />
    </div>
  );
}