import { useState, useEffect, useRef } from 'react';
import api from '../../services/api';
import { toast } from 'react-toastify';

const USER_COLORS = [
  { bg: 'bg-blue-50', border: 'border-l-blue-400', avatar: 'from-blue-400 to-blue-600', text: 'text-blue-700' },
  { bg: 'bg-green-50', border: 'border-l-green-400', avatar: 'from-green-400 to-green-600', text: 'text-green-700' },
  { bg: 'bg-yellow-50', border: 'border-l-yellow-400', avatar: 'from-yellow-400 to-yellow-600', text: 'text-yellow-700' },
  { bg: 'bg-pink-50', border: 'border-l-pink-400', avatar: 'from-pink-400 to-pink-600', text: 'text-pink-700' },
  { bg: 'bg-purple-50', border: 'border-l-purple-400', avatar: 'from-purple-400 to-purple-600', text: 'text-purple-700' },
  { bg: 'bg-indigo-50', border: 'border-l-indigo-400', avatar: 'from-indigo-400 to-indigo-600', text: 'text-indigo-700' },
  { bg: 'bg-teal-50', border: 'border-l-teal-400', avatar: 'from-teal-400 to-teal-600', text: 'text-teal-700' },
  { bg: 'bg-orange-50', border: 'border-l-orange-400', avatar: 'from-orange-400 to-orange-600', text: 'text-orange-700' },
];

function getUserStyle(userId) {
  if (!userId) return USER_COLORS[0];
  return USER_COLORS[userId % USER_COLORS.length];
}

function getInitials(firstName, lastName) {
  const first = firstName?.charAt(0)?.toUpperCase() || '';
  const last = lastName?.charAt(0)?.toUpperCase() || '';
  return first + last || '?';
}

export default function TaskComments({ taskId }) {
  const [task, setTask] = useState(null);
  const [comments, setComments] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const textareaRef = useRef(null);

  const fetchComments = async () => {
    try {
      const { data } = await api.get(`/tasks/${taskId}`);
      setTask(data);
      setComments(data.comments || []);
    } catch (err) {
      toast.error('Erreur lors du chargement.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [taskId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    try {
      await api.post(`/tasks/${taskId}/comments`, { text });
      setText('');
      // Réinitialiser la hauteur du textarea
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
      toast.success('Commentaire ajouté.');
      // Recharger les commentaires sans perdre l’en-tête
      const { data } = await api.get(`/tasks/${taskId}`);
      setComments(data.comments || []);
    } catch (err) {
      toast.error('Erreur lors de l’ajout du commentaire.');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  if (loading) return <p className="text-sm text-gray-400 p-4">Chargement...</p>;

  const assignees = task?.assignees || [];

  return (
    <div className="flex flex-col max-h-[70vh]">
      {/* En-tête : titre + assignés */}
      <div className="border-b border-gray-200 pb-4 mb-4">
        <h3 className="text-base font-semibold text-gray-900 mb-3">
          {task?.title || 'Tâche sans titre'}
        </h3>
        {assignees.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-gray-500">Assignée à :</span>
            {assignees.map((a) => {
              const style = getUserStyle(a.userId);
              const initials = getInitials(a.user?.firstName, a.user?.lastName);
              return (
                <div key={a.userId} className="flex items-center gap-1.5">
                  <div
                    className={`w-6 h-6 rounded-full bg-gradient-to-br ${style.avatar} flex items-center justify-center text-white text-[10px] font-bold`}
                  >
                    {initials}
                  </div>
                  <span className="text-sm text-gray-700">
                    {a.user?.firstName} {a.user?.lastName}
                  </span>
                </div>
              );
            })}
          </div>
        )}
        {assignees.length === 0 && (
          <p className="text-xs text-gray-400">Aucun assigné</p>
        )}
      </div>

      {/* Liste des commentaires (scrollable) */}
      <div className="flex-1 overflow-y-auto scrollbar-none space-y-4 pb-2">
        {comments.length === 0 ? (
          <p className="text-sm text-gray-400">Aucun commentaire.</p>
        ) : (
          comments.map((comment) => {
            const style = getUserStyle(comment.user?.id);
            const initials = getInitials(comment.user?.firstName, comment.user?.lastName);
            return (
              <div
                key={comment.id}
                className={`flex gap-3 ${style.bg} bg-opacity-60 rounded-xl p-4 border border-gray-200 border-l-4 shadow-sm hover:shadow-md transition-shadow`}
              >
                <div
                  className={`flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br ${style.avatar} flex items-center justify-center text-white text-sm font-bold shadow`}
                >
                  {initials}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className={`text-sm font-semibold ${style.text}`}>
                        {comment.user?.firstName} {comment.user?.lastName}
                      </p>
                      {comment.user?.role && (
                        <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-medium bg-gray-100 text-gray-600 border border-gray-200">
                          {comment.user.role.name}
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-gray-400 flex-shrink-0">
                      {new Date(comment.createdAt).toLocaleString('fr-FR', {
                        hour: '2-digit',
                        minute: '2-digit',
                        day: 'numeric',
                        month: 'short',
                      })}
                    </span>
                  </div>
                  <p className="text-sm text-gray-800 mt-1 whitespace-pre-wrap break-words">{comment.text}</p>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Barre de saisie fixée en bas */}
      <form onSubmit={handleSubmit} className="flex items-end gap-2 pt-3 border-t border-gray-200 mt-2">
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Écrire un commentaire..."
          rows={1}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none overflow-hidden"
          style={{ minHeight: '2.5rem', maxHeight: '8rem' }}
          onInput={(e) => {
            e.target.style.height = 'auto';
            e.target.style.height = e.target.scrollHeight + 'px';
          }}
        />
        <button
          type="submit"
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 flex-shrink-0"
        >
          Envoyer
        </button>
      </form>
    </div>
  );
}