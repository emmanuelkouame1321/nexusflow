import { useState, useEffect } from 'react';
import api from '../../services/api';
import { toast } from 'react-toastify';

export default function TaskComments({ taskId }) {
  const [comments, setComments] = useState([]);
  const [text, setText] = useState('');

  const fetchComments = async () => {
    try {
      const { data } = await api.get(`/tasks/${taskId}/comments`);
      setComments(data);
    } catch (err) {
      toast.error('Erreur chargement des commentaires.');
    }
  };

  useEffect(() => { fetchComments(); }, [taskId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    try {
      await api.post(`/tasks/${taskId}/comments`, { text });
      setText('');
      toast.success('Commentaire ajouté.');
      fetchComments();
    } catch (err) {
      toast.error('Erreur lors de l\'ajout.');
    }
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input type="text" value={text} onChange={(e) => setText(e.target.value)} placeholder="Ajouter un commentaire..."
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700">Envoyer</button>
      </form>
      <div className="space-y-3">
        {comments.map((comment) => (
          <div key={comment.id} className="bg-gray-50 p-3 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-800">{comment.text}</p>
            <p className="text-xs text-gray-500 mt-1">
              {comment.user?.firstName} {comment.user?.lastName} – {new Date(comment.createdAt).toLocaleString('fr-FR')}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}