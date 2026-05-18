import { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell, ResponsiveContainer, Legend
} from 'recharts';
import { toast } from 'react-toastify';
import api from '../../services/api';
import DataTable from '../../components/shared/DataTable';

// ------------------------------------------------------------
// 1. Carte KPI (chiffre clé)
// ------------------------------------------------------------
function KpiCard({ label, value, icon, trend, loading }) {
  if (loading) {
    return (
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
        <div className="h-8 bg-gray-200 rounded w-16 mb-1"></div>
        <div className="h-3 bg-gray-200 rounded w-12"></div>
      </div>
    );
  }

  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex items-start justify-between">
      <div>
        <p className="text-xs font-medium text-gray-500 uppercase">{label}</p>
        <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
        {trend !== undefined && (
          <p className={`text-xs mt-1 ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
          </p>
        )}
      </div>
      <div className="text-indigo-400">
        {icon}
      </div>
    </div>
  );
}

// ------------------------------------------------------------
// 2. Graphique CA mensuel (BarChart)
// ------------------------------------------------------------
function RevenueChart({ data, loading }) {
  if (loading) return <SkeletonGraph />;
  if (!data?.length) return <EmptyState message="Aucune donnée de CA" />;

  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">CA mensuel (12 mois)</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip formatter={(value) => `${value} €`} />
          <Bar dataKey="revenue" fill="#6366f1" radius={[4,4,0,0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// ------------------------------------------------------------
// 3. Pipeline (camembert)
// ------------------------------------------------------------
function PipelineChart({ data, loading }) {
  if (loading) return <SkeletonGraph />;
  if (!data?.length) return <EmptyState message="Aucun devis" />;

  const COLORS = { draft: '#9ca3af', sent: '#60a5fa', accepted: '#34d399', refused: '#f87171' };

  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Pipeline des devis</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie data={data} dataKey="count" nameKey="status" cx="50%" cy="50%" outerRadius={100}>
            {data.map((entry, index) => (
              <Cell key={index} fill={COLORS[entry.status] || '#ccc'} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

// ------------------------------------------------------------
// 4. Charge utilisateurs (barres horizontales)
// ------------------------------------------------------------
function WorkloadChart({ data, loading }) {
  if (loading) return <SkeletonGraph />;
  if (!data?.length) return <EmptyState message="Aucune tâche assignée" />;

  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Charge par utilisateur</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart layout="vertical" data={data} margin={{ left: 20 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" />
          <YAxis dataKey="lastName" type="category" tick={{ fontSize: 12 }} />
          <Tooltip />
          <Bar dataKey="taskCount" fill="#818cf8" radius={[0,4,4,0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// ------------------------------------------------------------
// 5. Projets en retard (mini-tableau)
// ------------------------------------------------------------
function OverdueProjects({ data, loading }) {
  const columns = [
    { key: 'name', label: 'Projet' },
    { key: 'clientName', label: 'Client' },
    { key: 'endDate', label: 'Échéance', render: (row) => new Date(row.endDate).toLocaleDateString('fr-FR') },
  ];

  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Projets en retard</h3>
      {loading ? (
        <SkeletonTable rows={3} cols={3} />
      ) : data?.length > 0 ? (
        <DataTable columns={columns} data={data} />
      ) : (
        <EmptyState message="Tous les projets sont dans les temps" />
      )}
    </div>
  );
}

// ------------------------------------------------------------
// Composants utilitaires
// ------------------------------------------------------------
function SkeletonGraph() {
  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-32 mb-4"></div>
      <div className="h-48 bg-gray-100 rounded"></div>
    </div>
  );
}

function SkeletonTable({ rows = 3, cols = 3 }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-2">
          {Array.from({ length: cols }).map((_, j) => (
            <div key={j} className="h-4 bg-gray-200 rounded flex-1 animate-pulse"></div>
          ))}
        </div>
      ))}
    </div>
  );
}

function EmptyState({ message }) {
  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 text-center py-8 text-gray-400">
      <svg className="mx-auto h-12 w-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      <p className="mt-2 text-sm">{message}</p>
    </div>
  );
}

// ------------------------------------------------------------
// COMPOSANT PRINCIPAL DU DASHBOARD
// ------------------------------------------------------------
export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const { data: dashboardData } = await api.get('/dashboard');
        setData(dashboardData);
        setError(false);
      } catch (err) {
        console.error(err);
        setError(true);
        toast.error('Impossible de charger le tableau de bord.');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (error) {
    return (
      <div className="text-center py-20 text-red-500">
        Erreur lors du chargement des indicateurs.
      </div>
    );
  }

  // Préparer les données pour les graphiques
  const monthlyRevenue = data?.monthlyRevenue?.map((r) => ({
    month: new Date(r.month).toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' }),
    revenue: r.revenue,
  })) || [];

  const pipelineData = data?.quotesPipeline || [];
  const workloadData = data?.usersWorkload || [];
  const overdueProjects = data?.overdueProjects || [];

  return (
    <div className="space-y-6">
      {/* En-tête avec exports */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Tableau de bord</h2>
        <div className="flex gap-2">
          <a
            href="/api/v1/dashboard/export/csv"
            target="_blank"
            className="inline-flex items-center gap-1 px-3 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            CSV
          </a>
          <a
            href="/api/v1/dashboard/export/pdf"
            target="_blank"
            className="inline-flex items-center gap-1 px-3 py-2 bg-gray-600 text-white text-sm font-medium rounded-lg hover:bg-gray-700 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            PDF
          </a>
        </div>
      </div>

      {/* Ligne 1 : KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="Clients"
          value={data?.totalClients || 0}
          icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
          loading={loading}
        />
        <KpiCard
          label="Devis"
          value={data?.totalQuotes || 0}
          icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>}
          loading={loading}
        />
        <KpiCard
          label="Factures impayées"
          value={`${data?.outstandingInvoices?.total?.toFixed(2) || '0'} €`}
          icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
          loading={loading}
        />
        <KpiCard
          label="Total factures"
          value={data?.totalInvoices || 0}
          icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>}
          loading={loading}
        />
      </div>

      {/* Ligne 2 : Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <RevenueChart data={monthlyRevenue} loading={loading} />
        <PipelineChart data={pipelineData} loading={loading} />
      </div>

      {/* Ligne 3 : Charge + Projets en retard */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <WorkloadChart data={workloadData} loading={loading} />
        <OverdueProjects data={overdueProjects} loading={loading} />
      </div>
    </div>
  );
}