import Joi from 'joi';

export const createProjectSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  description: Joi.string().max(1000).allow('', null),
  clientId: Joi.number().integer().optional(),
  startDate: Joi.date().iso().optional(),
  endDate: Joi.date().iso().optional(),
  budget: Joi.number().precision(2).positive().allow(null),
  memberIds: Joi.array().items(Joi.number().integer()).optional(),
});

export const updateProjectSchema = Joi.object({
  name: Joi.string().min(2).max(100),
  description: Joi.string().max(1000).allow('', null),
  clientId: Joi.number().integer().optional(),
  startDate: Joi.date().iso().optional(),
  endDate: Joi.date().iso().optional(),
  budget: Joi.number().precision(2).positive().allow(null),
  status: Joi.string().valid('planned', 'in_progress', 'completed', 'on_hold', 'cancelled'),
  memberIds: Joi.array().items(Joi.number().integer()).optional(),
}).min(1);