import * as invoiceService from './invoices.service.js';

function handleError(error, res) {
  if (error.code === 'P2002') {
    return res.status(409).json({ message: 'Une contrainte unique a été violée.' });
  }
  if (error.code === 'P2025') {
    return res.status(404).json({ message: 'Facture introuvable.' });
  }
  return false;
}

export async function create(req, res, next) {
  try {
    const invoice = await invoiceService.createInvoice(req.body);
    res.status(201).json(invoice);
  } catch (error) {
    if (!handleError(error, res)) next(error);
  }
}

export async function getAll(req, res, next) {
  try {
    const { status, clientId, search, page, limit } = req.query;
    const result = await invoiceService.findAll({ status, clientId, search, page, limit });
    res.json(result);
  } catch (error) {
    next(error);
  }
}

export async function getOne(req, res, next) {
  try {
    const invoice = await invoiceService.findById(+req.params.id);
    if (!invoice) return res.status(404).json({ message: 'Facture introuvable.' });
    res.json(invoice);
  } catch (error) {
    next(error);
  }
}

export async function addPayment(req, res, next) {
  try {
    const payment = await invoiceService.addPayment(+req.params.id, req.body);
    res.status(201).json(payment);
  } catch (error) {
    if (!handleError(error, res)) next(error);
  }
}

export async function getBalance(req, res, next) {
  try {
    const balance = await invoiceService.getBalance(+req.params.id);
    if (!balance) return res.status(404).json({ message: 'Facture introuvable.' });
    res.json(balance);
  } catch (error) {
    next(error);
  }
}

export async function remove(req, res, next) {
  try {
    await invoiceService.removeInvoice(+req.params.id);
    res.status(204).end();
  } catch (error) {
    if (!handleError(error, res)) next(error);
  }
}
