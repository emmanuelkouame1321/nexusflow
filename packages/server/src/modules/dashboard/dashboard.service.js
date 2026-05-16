import prisma from '../../lib/prisma.js';

/**
 * Chiffre d’affaires par mois sur les 12 derniers mois.
 */
export async function getMonthlyRevenue() {
  const result = await prisma.$queryRaw`
    SELECT
      DATE_TRUNC('month', "Invoice"."createdAt") AS month,
      SUM("Invoice"."totalTTC")::float AS revenue
    FROM "Invoice"
    WHERE "Invoice"."status" IN ('paid', 'partially_paid')
      AND "Invoice"."createdAt" >= NOW() - INTERVAL '12 months'
    GROUP BY month
    ORDER BY month ASC
  `;
  return result;
}

/**
 * Montant total des factures impayées ou en retard.
 */
export async function getOutstandingInvoices() {
  const result = await prisma.$queryRaw`
    SELECT
      COUNT(*)::int AS count,
      COALESCE(SUM("totalTTC"), 0)::float AS total
    FROM "Invoice"
    WHERE "status" IN ('sent', 'partially_paid', 'overdue')
  `;
  return result[0] || { count: 0, total: 0 };
}

/**
 * Pipeline commercial : nombre de devis par statut.
 */
export async function getQuotesPipeline() {
  const result = await prisma.$queryRaw`
    SELECT status, COUNT(*)::int AS count
    FROM "Quote"
    GROUP BY status
    ORDER BY status
  `;
  return result;
}

/**
 * Charge de travail par utilisateur (tâches non terminées).
 */
export async function getUsersWorkload() {
  const result = await prisma.$queryRaw`
    SELECT
      u.id,
      u."firstName",
      u."lastName",
      COUNT(ta."taskId")::int AS "taskCount"
    FROM "User" u
    JOIN "TaskAssignee" ta ON ta."userId" = u.id
    JOIN "Task" t ON t.id = ta."taskId"
    WHERE t.status != 'done'
    GROUP BY u.id, u."firstName", u."lastName"
    ORDER BY "taskCount" DESC
  `;
  return result;
}

/**
 * Projets en retard (date de fin dépassée et statut non terminé).
 */
export async function getOverdueProjects() {
  const result = await prisma.$queryRaw`
    SELECT
      p.id,
      p.name,
      p."endDate",
      c.name AS "clientName"
    FROM "Project" p
    LEFT JOIN "Client" c ON c.id = p."clientId"
    WHERE p.status NOT IN ('completed', 'cancelled')
      AND p."endDate" < NOW()
    ORDER BY p."endDate" ASC
  `;
  return result;
}

/**
 * Nombre total de clients.
 */
export async function getTotalClients() {
  return prisma.client.count();
}

/**
 * Nombre total de devis.
 */
export async function getTotalQuotes() {
  return prisma.quote.count();
}

/**
 * Nombre total de factures.
 */
export async function getTotalInvoices() {
  return prisma.invoice.count();
}

/**
 * Tous les KPIs en une seule réponse.
 */
export async function getFullDashboard() {
  const [
    monthlyRevenue,
    outstandingInvoices,
    quotesPipeline,
    usersWorkload,
    overdueProjects,
    totalClients,
    totalQuotes,
    totalInvoices,
  ] = await Promise.all([
    getMonthlyRevenue(),
    getOutstandingInvoices(),
    getQuotesPipeline(),
    getUsersWorkload(),
    getOverdueProjects(),
    getTotalClients(),
    getTotalQuotes(),
    getTotalInvoices(),
  ]);

  return {
    monthlyRevenue,
    outstandingInvoices,
    quotesPipeline,
    usersWorkload,
    overdueProjects,
    totalClients,
    totalQuotes,
    totalInvoices,
  };
}
