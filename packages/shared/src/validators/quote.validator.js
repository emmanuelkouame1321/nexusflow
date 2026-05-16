import Joi from 'joi';

const quoteItemSchema = Joi.object({
  productId: Joi.number().integer().required(),
  description: Joi.string().max(255).optional(),
  quantity: Joi.number().integer().min(1).required(),
  unitPrice: Joi.number().precision(2).positive().required(),
  discount: Joi.number().precision(2).min(0).default(0),
  taxRate: Joi.number().precision(2).min(0).default(0),
});

export const createQuoteSchema = Joi.object({
  clientId: Joi.number().integer().required(),
  validUntil: Joi.date().iso().optional(),
  items: Joi.array().items(quoteItemSchema).min(1).required(),
});

export const updateQuoteStatusSchema = Joi.object({
  status: Joi.string().valid('draft', 'sent', 'accepted', 'refused').required(),
});
