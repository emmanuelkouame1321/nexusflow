import * as productService from './products.service.js';

export async function getAll(req, res, next) {
  try {
    const products = await productService.findAll();
    return res.json(products);
  } catch (error) {
    next(error);
  }
}

export async function getOne(req, res, next) {
  try {
    const product = await productService.findById(+req.params.id);
    if (!product) return res.status(404).json({ message: 'Produit introuvable' });
    return res.json(product);
  } catch (error) {
    next(error);
  }
}

export async function create(req, res, next) {
  try {
    const product = await productService.create(req.body);
    return res.status(201).json(product);
  } catch (error) {
    next(error);
  }
}

export async function update(req, res, next) {
  try {
    const product = await productService.update(+req.params.id, req.body);
    return res.json(product);
  } catch (error) {
    next(error);
  }
}

export async function remove(req, res, next) {
  try {
    await productService.remove(+req.params.id);
    return res.status(204).end();
  } catch (error) {
    next(error);
  }
}
