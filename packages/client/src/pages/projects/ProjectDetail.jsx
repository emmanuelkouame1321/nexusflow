import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import ProjectInfoTab from './tabs/ProjectInfoTab';
import ProjectKanbanTab from './tabs/ProjectKanbanTab';
import ProjectCalendarTab from './tabs/ProjectCalendarTab';
import ProjectTeamTab from './tabs/ProjectTeamTab';
import ProjectFilesTab from './tabs/ProjectFilesTab';
import { useHasRole } from '../../hooks/useHasRole'; // ← ajouté

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [activeTab, setActiveTab] = useState('kanban');   // onglet par défaut
  const [loading, setLoading] = useState(true);

  // Droits pour gérer l'équipe
  const canManageTeam = useHasRole('admin', 'manager', 'project_manager');

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const { data } = await api.get(`/projects/${id}`);
        setProject(data);
      } catch (err) {
        console.error('Erreur chargement projet', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProject();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <svg className="animate-spin h-6 w-6 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
    );
  }

  if (!project) return <div className="text-center py-10 text-red-500">Projet introuvable.</div>;

  const tabs = [
    { key: 'kanban', label: 'Kanban' },
    { key: 'calendar', label: 'Calendrier' },
    // L'onglet Équipe n'apparaît que si l'utilisateur a les droits
    ...(canManageTeam ? [{ key: 'team', label: 'Équipe' }] : []),
    { key: 'info', label: 'Infos' },
    { key: 'files', label: 'Fichiers' },
  ];

  const renderTab = () => {
    switch (activeTab) {
      case 'kanban': return <ProjectKanbanTab projectId={project.id} />;
      case 'calendar': return <ProjectCalendarTab projectId={project.id} />;
      case 'team': return <ProjectTeamTab project={project} onUpdate={setProject} />;
      case 'info': return <ProjectInfoTab project={project} />;
      case 'files': return <ProjectFilesTab projectId={project.id} />;
      default: return null;
    }
  };

  return (
    <div className="space-y-4">
      {/* En-tête */}
      <div className="sticky top-16 md:top-0 z-20 bg-gray-50 pt-1 pb-3 -mx-4 px-4 sm:mx-0 sm:px-0 border-b border-gray-200 flex items-center gap-2">
        <button onClick={() => navigate('/projects')} className="text-indigo-600 hover:text-indigo-800 flex-shrink-0">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">{project.name}</h2>
      </div>

      {/* Onglets */}
      <div className="border-b border-gray-200 overflow-x-auto">
        <nav className="flex space-x-4 sm:space-x-6 min-w-max px-1">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`py-3 px-1 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                activeTab === tab.key
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Contenu de l'onglet */}
      <div>{renderTab()}</div>
    </div>
  );
}