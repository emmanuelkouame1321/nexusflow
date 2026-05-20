import { useState, useEffect } from 'react';
import api from '../../../services/api';
import { toast } from 'react-toastify';

export default function ProjectFilesTab({ projectId }) {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);

  const fetchFiles = async () => {
    try {
      const { data } = await api.get(`/attachments/project/${projectId}`);
      setFiles(data);
    } catch (err) {
      toast.error('Erreur chargement des fichiers.');
    }
  };

  useEffect(() => { fetchFiles(); }, [projectId]);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      await api.post(`/attachments/project/${projectId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('Fichier uploadé.');
      fetchFiles();
    } catch (err) {
      toast.error('Erreur lors de l\'upload.');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (fileId) => {
    try {
      await api.delete(`/attachments/${fileId}`);
      toast.success('Fichier supprimé.');
      fetchFiles();
    } catch (err) {
      toast.error('Erreur lors de la suppression.');
    }
  };

  return (
    <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-100">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Pièces jointes</h3>
        <label className="px-3 py-1.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 cursor-pointer">
          {uploading ? 'Upload...' : 'Ajouter un fichier'}
          <input type="file" className="hidden" onChange={handleUpload} disabled={uploading} />
        </label>
      </div>
      {files.length === 0 ? (
        <p className="text-sm text-gray-400">Aucun fichier.</p>
      ) : (
        <div className="space-y-2">
          {files.map((file) => (
            <div key={file.id} className="flex items-center justify-between p-2 border border-gray-200 rounded-lg text-sm">
              <div className="flex items-center gap-2 truncate">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                <a href={file.url} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline truncate">{file.originalName}</a>
              </div>
              <button onClick={() => handleDelete(file.id)} className="text-red-500 hover:text-red-700 text-xs font-medium ml-2">
                Supprimer
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}