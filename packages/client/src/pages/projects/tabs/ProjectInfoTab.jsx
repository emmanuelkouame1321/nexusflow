import StatusBadge from '../../../components/shared/StatusBadge';

export default function ProjectInfoTab({ project }) {
  return (
    <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-100">
      <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <dt className="text-xs font-medium text-gray-500 uppercase">Nom</dt>
          <dd className="text-sm text-gray-900 mt-1">{project.name}</dd>
        </div>
        <div>
          <dt className="text-xs font-medium text-gray-500 uppercase">Statut</dt>
          <dd className="mt-1"><StatusBadge status={project.status} size="sm" /></dd>
        </div>
        <div>
          <dt className="text-xs font-medium text-gray-500 uppercase">Client</dt>
          <dd className="text-sm text-gray-900 mt-1">{project.client?.name || '—'}</dd>
        </div>
        <div>
          <dt className="text-xs font-medium text-gray-500 uppercase">Budget</dt>
          <dd className="text-sm text-gray-900 mt-1">{project.budget ? `${project.budget} €` : '—'}</dd>
        </div>
        <div>
          <dt className="text-xs font-medium text-gray-500 uppercase">Début</dt>
          <dd className="text-sm text-gray-900 mt-1">{project.startDate ? new Date(project.startDate).toLocaleDateString('fr-FR') : '—'}</dd>
        </div>
        <div>
          <dt className="text-xs font-medium text-gray-500 uppercase">Fin</dt>
          <dd className="text-sm text-gray-900 mt-1">{project.endDate ? new Date(project.endDate).toLocaleDateString('fr-FR') : '—'}</dd>
        </div>
        <div className="sm:col-span-2">
          <dt className="text-xs font-medium text-gray-500 uppercase">Description</dt>
          <dd className="text-sm text-gray-900 mt-1">{project.description || '—'}</dd>
        </div>
      </dl>
    </div>
  );
}