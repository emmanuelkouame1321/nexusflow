import * as dashboardService from './dashboard.service.js';
import { convertToCSV } from '../../utils/csvHelper.js';
import { generatePDF } from '../../utils/pdfGenerator.js';

export async function getFull(req, res, next) {
  try {
    const data = await dashboardService.getFullDashboard();
    res.json(data);
  } catch (error) {
    next(error);
  }
}

export async function getMonthlyRevenue(req, res, next) {
  try {
    const data = await dashboardService.getMonthlyRevenue();
    res.json(data);
  } catch (error) {
    next(error);
  }
}

export async function getOutstandingInvoices(req, res, next) {
  try {
    const data = await dashboardService.getOutstandingInvoices();
    res.json(data);
  } catch (error) {
    next(error);
  }
}

export async function getQuotesPipeline(req, res, next) {
  try {
    const data = await dashboardService.getQuotesPipeline();
    res.json(data);
  } catch (error) {
    next(error);
  }
}

export async function getUsersWorkload(req, res, next) {
  try {
    const data = await dashboardService.getUsersWorkload();
    res.json(data);
  } catch (error) {
    next(error);
  }
}

export async function getOverdueProjects(req, res, next) {
  try {
    const data = await dashboardService.getOverdueProjects();
    res.json(data);
  } catch (error) {
    next(error);
  }
}

/**
 * GET /dashboard/export/csv
 */
export async function exportCSV(req, res, next) {
  try {
    const data = await dashboardService.getFullDashboard();
    const monthly = data.monthlyRevenue.map((r) => ({
      month: r.month,
      revenue: r.revenue,
    }));

    const csv = convertToCSV(monthly, ['month', 'revenue']);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=dashboard.csv');
    res.send(csv);
  } catch (error) {
    next(error);
  }
}

/**
 * GET /dashboard/export/pdf
 */
export async function exportPDF(req, res, next) {
  try {
    const data = await dashboardService.getFullDashboard();
    const outstanding = data.outstandingInvoices;

    const pdf = await generatePDF('dashboard.html', {
      date: new Date().toLocaleDateString('fr-FR'),
      totalClients: data.totalClients,
      totalQuotes: data.totalQuotes,
      totalInvoices: data.totalInvoices,
      outstandingCount: outstanding.count,
      outstandingTotal: outstanding.total.toFixed(2),
      monthlyRevenue: data.monthlyRevenue.map((r) => ({
        month: new Date(r.month).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }),
        revenue: r.revenue.toFixed(2),
      })),
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=dashboard.pdf');
    res.send(pdf);
  } catch (error) {
    next(error);
  }
}
