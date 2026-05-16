import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../../lib/prisma.js';
import env from '../../config/env.js';

const SALT_ROUNDS = 12;

/**
 * Hache un mot de passe.
 */
export async function hashPassword(password) {
  return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Compare un mot de passe en clair avec un hash.
 */
export async function comparePassword(password, hash) {
  return bcrypt.compare(password, hash);
}

/**
 * Génère un access token (courte durée).
 */
export function generateAccessToken(user) {
  return jwt.sign({ userId: user.id, role: user.role.name }, env.jwt.accessSecret, {
    expiresIn: env.jwt.accessExpiration,
  });
}

/**
 * Génère un refresh token (longue durée).
 */
export function generateRefreshToken(user) {
  return jwt.sign({ userId: user.id }, env.jwt.refreshSecret, {
    expiresIn: env.jwt.refreshExpiration,
  });
}

/**
 * Vérifie un access token et retourne le payload.
 */
export function verifyAccessToken(token) {
  return jwt.verify(token, env.jwt.accessSecret);
}

/**
 * Vérifie un refresh token et retourne le payload.
 */
export function verifyRefreshToken(token) {
  return jwt.verify(token, env.jwt.refreshSecret);
}

/**
 * Enregistre le refresh token en base (pour pouvoir l'invalider plus tard).
 */
export async function saveRefreshToken(userId, token) {
  await prisma.user.update({
    where: { id: userId },
    data: { refreshToken: token },
  });
}

/**
 * Supprime le refresh token en base (logout).
 */
export async function removeRefreshToken(userId) {
  await prisma.user.update({
    where: { id: userId },
    data: { refreshToken: null },
  });
}

/**
 * Récupère un utilisateur par email (avec son rôle).
 */
export async function getUserByEmail(email) {
  return prisma.user.findUnique({
    where: { email },
    include: { role: true },
  });
}

/**
 * Récupère un utilisateur par son ID (avec son rôle).
 */
export async function getUserById(id) {
  return prisma.user.findUnique({
    where: { id },
    include: { role: true },
  });
}

/**
 * Crée un nouvel utilisateur.
 */
export async function createUser({ firstName, lastName, email, password, roleId }) {
  const passwordHash = await hashPassword(password);
  return prisma.user.create({
    data: {
      firstName,
      lastName,
      email,
      passwordHash,
      roleId,
    },
    include: { role: true },
  });
}
