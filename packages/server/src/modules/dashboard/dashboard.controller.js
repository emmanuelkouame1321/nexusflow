import * as dashboardService from './dashboard.service.js';

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
