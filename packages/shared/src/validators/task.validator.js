import Joi from 'joi';

export const createTaskSchema = Joi.object({
  title: Joi.string().min(2).max(200).required(),
  description: Joi.string().max(2000).allow(''),
  projectId: Joi.number().integer().required(),
  parentTaskId: Joi.number().integer().allow(null),
  priority: Joi.string().valid('low', 'medium', 'high', 'urgent').default('medium'),
  dueDate: Joi.date().iso().allow(null),
  estimatedHours: Joi.number().precision(1).min(0).allow(null),
  assigneeIds: Joi.array().items(Joi.number().integer()),
});

export const updateTaskStatusSchema = Joi.object({
  status: Joi.string().valid('todo', 'in_progress', 'in_review', 'done').required(),
});
