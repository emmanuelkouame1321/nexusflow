import Joi from 'joi';

export const createProjectSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  description: Joi.string().max(1000).allow(''),
  clientId: Joi.number().integer().allow(null),
  startDate: Joi.date().iso().optional(),
  endDate: Joi.date().iso().optional(),
  budget: Joi.number().precision(2).positive().allow(null),
});

export const updateProjectSchema = createProjectSchema.keys({
  name: Joi.string().min(2).max(100),
  status: Joi.string().valid('planned', 'in_progress', 'completed', 'on_hold', 'cancelled'),
});
