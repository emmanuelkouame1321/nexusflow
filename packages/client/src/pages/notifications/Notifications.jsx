import { useState, useEffect } from 'react';
import api from '../../services/api';
import { toast } from 'react-toastify';

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all' ou 'unread'

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const params = { limit: 50 }; // charge jusqu'à 50 notifications
      if (filter === 'unread') params.unread = 'true';
      const { data } = await api.get('/notifications', { params });
      setNotifications(data.notifications || []);
    } catch (err) {
      toast.error('Erreur lors du chargement des notifications.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [filter]);

  const markAsRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      toast.success('Notification marquée comme lue.');
      window.dispatchEvent(new Event('notification-read'));
      fetchNotifications();
    } catch (err) {
      toast.error('Erreur.');
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.patch('/notifications/read-all');
      toast.success('Toutes les notifications ont été marquées comme lues.');
      window.dispatchEvent(new Event('notification-read'));
      fetchNotifications();
    } catch (err) {
      toast.error('Erreur.');
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* En-tête */}
      <div className="sticky top-16 md:top-0 z-20 bg-gray-50 pt-1 pb-3 -mx-4 px-4 sm:mx-0 sm:px-0 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Notifications</h2>
        <div className="flex gap-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">Toutes</option>
            <option value="unread">Non lues</option>
          </select>
          <button
            onClick={markAllAsRead}
            className="px-3 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700"
          >
            Tout marquer comme lu
          </button>
        </div>
      </div>

      {/* Liste scrollable */}
      {loading ? (
        <div className="flex justify-center py-10">
          <svg className="animate-spin h-6 w-6 text-indigo-500" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        </div>
      ) : notifications.length === 0 ? (
        <div className="text-center py-10 text-gray-400">Aucune notification.</div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-2 overflow-y-auto scrollbar-none" style={{ maxHeight: '24rem' }}>
          {notifications.map((notif) => (
            <div
              key={notif.id}
              className={`flex items-center justify-between p-3 rounded-lg mb-2 ${
                notif.read ? 'bg-gray-50' : 'bg-indigo-50 font-semibold'
              }`}
            >
              <div className="flex-1 min-w-0">
                <p className={`text-sm ${notif.read ? 'text-gray-600' : 'text-gray-900'}`}>
                  {notif.message}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {new Date(notif.createdAt).toLocaleString('fr-FR')}
                </p>
              </div>
              {!notif.read && (
                <button
                  onClick={() => markAsRead(notif.id)}
                  className="ml-3 text-indigo-600 hover:text-indigo-800 text-xs font-medium"
                >
                  Marquer lue
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}