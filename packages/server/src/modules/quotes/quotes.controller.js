import * as quoteService from './quotes.service.js';

function handleError(error, res) {
  if (error.code === 'P2002') {
    return res.status(409).json({ message: 'Une erreur de doublon est survenue.' });
  }
  if (error.code === 'P2025') {
    return res.status(404).json({ message: 'Devis introuvable.' });
  }
  return false;
}

export async function create(req, res, next) {
  try {
    const quote = await quoteService.createQuote(req.body);
    return res.status(201).json(quote);
  } catch (error) {
    if (!handleError(error, res)) next(error);
  }
}

export async function getAll(req, res, next) {
  try {
    const { status, clientId, page, limit } = req.query;
    const result = await quoteService.findAll({ status, clientId, page, limit });
    return res.json(result);
  } catch (error) {
    next(error);
  }
}

export async function getOne(req, res, next) {
  try {
    const quote = await quoteService.findById(+req.params.id);
    if (!quote) return res.status(404).json({ message: 'Devis introuvable.' });
    return res.json(quote);
  } catch (error) {
    next(error);
  }
}

export async function updateStatus(req, res, next) {
  try {
    const { status } = req.body;
    const quote = await quoteService.updateStatus(+req.params.id, status);
    return res.json(quote);
  } catch (error) {
    if (!handleError(error, res)) next(error);
  }
}

export async function remove(req, res, next) {
  try {
    await quoteService.removeQuote(+req.params.id);
    return res.status(204).end();
  } catch (error) {
    if (!handleError(error, res)) next(error);
  }
}
