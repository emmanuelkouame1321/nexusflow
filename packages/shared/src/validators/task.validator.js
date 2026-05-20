import Joi from 'joi';

export const createTaskSchema = Joi.object({
  title: Joi.string().min(2).max(200).required(),
  description: Joi.string().max(2000).allow('', null),
  projectId: Joi.number().integer().required(),
  parentTaskId: Joi.number().integer().optional(),
  priority: Joi.string().valid('low', 'medium', 'high', 'urgent').default('medium'),
  dueDate: Joi.string().isoDate().allow('', null).optional(),
  estimatedHours: Joi.number().precision(1).min(0).allow(null),
  assigneeIds: Joi.array().items(Joi.number().integer()).optional(),
  status: Joi.string().valid('todo', 'in_progress', 'in_review', 'done'),
});

export const updateTaskSchema = Joi.object({
  title: Joi.string().min(2).max(200),
  description: Joi.string().max(2000).allow('', null),
  status: Joi.string().valid('todo', 'in_progress', 'in_review', 'done'),
  priority: Joi.string().valid('low', 'medium', 'high', 'urgent'),
  dueDate: Joi.string().isoDate().allow('', null).optional(),
  estimatedHours: Joi.number().precision(1).min(0).allow(null),
  actualHours: Joi.number().precision(1).min(0).allow(null),
  assigneeIds: Joi.array().items(Joi.number().integer()).optional(),
}).min(1);