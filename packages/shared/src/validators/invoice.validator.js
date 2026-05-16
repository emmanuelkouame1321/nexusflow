import Joi from 'joi';

const invoiceItemSchema = Joi.object({
  productId: Joi.number().integer().required(),
  description: Joi.string().max(255).optional(),
  quantity: Joi.number().integer().min(1).required(),
  unitPrice: Joi.number().precision(2).positive().required(),
  discount: Joi.number().precision(2).min(0).default(0),
  taxRate: Joi.number().precision(2).min(0).default(0),
});

export const createInvoiceSchema = Joi.object({
  clientId: Joi.number().integer().required(),
  quoteId: Joi.number().integer().optional(), // si converti depuis devis
  dueDate: Joi.date().iso().required(),
  items: Joi.array().items(invoiceItemSchema).min(1).required(),
});

export const addPaymentSchema = Joi.object({
  amount: Joi.number().precision(2).positive().required(),
  date: Joi.date().iso().required(),
  method: Joi.string().max(50).required(),
  reference: Joi.string().max(100).optional(),
});
