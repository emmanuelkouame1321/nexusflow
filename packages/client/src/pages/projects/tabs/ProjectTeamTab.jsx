import { useState, useEffect } from 'react';
import api from '../../../services/api';
import { toast } from 'react-toastify';

export default function ProjectTeamTab({ project, onUpdate }) {
  const [users, setUsers] = useState([]);
  const [selectedIds, setSelectedIds] = useState(project.members?.map((m) => m.userId) || []);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { data } = await api.get('/users');
        setUsers(data.users || []);
      } catch {}
    };
    fetchUsers();
  }, []);

  const handleSave = async () => {
    try {
      await api.put(`/projects/${project.id}`, { memberIds: selectedIds });
      toast.success('Membres mis à jour.');
      const { data } = await api.get(`/projects/${project.id}`);
      onUpdate(data);
    } catch (err) {
      toast.error('Erreur lors de la mise à jour.');
    }
  };

  const toggleUser = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((uid) => uid !== id) : [...prev, id]
    );
  };

  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
      <h3 className="text-lg font-semibold mb-4">Membres de l'équipe</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
        {users.map((user) => (
          <label key={user.id} className="flex items-center gap-2 p-2 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer text-sm">
            <input type="checkbox" checked={selectedIds.includes(user.id)} onChange={() => toggleUser(user.id)}
              className="rounded text-indigo-600 focus:ring-indigo-500" />
            {user.firstName} {user.lastName}
          </label>
        ))}
      </div>
      <button onClick={handleSave} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700">
        Enregistrer les membres
      </button>
    </div>
  );
}