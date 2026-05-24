import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { getSocket } from '../../services/socket';

export default function NotificationBell() {
  const [count, setCount] = useState(0);
  const navigate = useNavigate();
  const intervalRef = useRef(null);

  const fetchCount = async () => {
    try {
      const { data } = await api.get('/notifications?unread=true&limit=1');
      setCount(data.total || 0);
    } catch (err) {
      console.warn('[NotificationBell] Erreur :', err.message);
    }
  };

  useEffect(() => {
    fetchCount();
    intervalRef.current = setInterval(fetchCount, 60_000);

    const socket = getSocket();
    if (socket) {
      socket.on('notification', fetchCount);
    }

    // Écouter l’événement personnalisé déclenché par la page Notifications
    const handleNotificationRead = () => fetchCount();
    window.addEventListener('notification-read', handleNotificationRead);

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') fetchCount();
    };
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      clearInterval(intervalRef.current);
      if (socket) socket.off('notification');
      window.removeEventListener('notification-read', handleNotificationRead);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, []);

  return (
    <button
      type="button"
      aria-label={`Notifications${count > 0 ? `, ${count} non lues` : ''}`}
      className="relative flex items-center justify-center p-2.5 text-gray-600 hover:text-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-400 rounded-full transition-colors"
      onClick={() => navigate('/notifications')}
    >
      <svg className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
      </svg>
      {count > 0 && (
        <span className="absolute top-[2px] right-[2px] inline-flex items-center justify-center min-w-[14px] h-[14px] text-[9px] font-bold leading-none text-white bg-red-500 rounded-full shadow-md">
          {count > 99 ? '99+' : count}
        </span>
      )}
    </button>
  );
}