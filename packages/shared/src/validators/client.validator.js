import Joi from 'joi';

export const createClientSchema = Joi.object({
  name: Joi.string().min(2).max(100).required().messages({
    'string.empty': 'Le nom est obligatoire.',
  }),
  email: Joi.string().email().required().messages({
    'string.email': 'Email invalide.',
    'string.empty': "L'email est obligatoire.",
  }),
  phone: Joi.string().min(6).max(30).required().messages({
    'string.empty': 'Le téléphone est obligatoire.',
  }),
  address: Joi.string().max(255).allow('', null),
  sector: Joi.string().max(100).allow('', null),
  tags: Joi.array().items(Joi.string()),
});

export const updateClientSchema = Joi.object({
  name: Joi.string().min(2).max(100),
  email: Joi.string().email().messages({
    'string.email': 'Email invalide.',
  }),
  phone: Joi.string().min(6).max(30),
  address: Joi.string().max(255).allow('', null),
  sector: Joi.string().max(100).allow('', null),
  tags: Joi.array().items(Joi.string()),
})
  .min(1)
  .messages({
    'object.min': 'Au moins un champ doit être fourni pour la mise à jour.',
  });
