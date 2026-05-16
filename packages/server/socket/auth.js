import { verifyAccessToken } from '../src/modules/auth/auth.service.js';

export function authenticateSocket(socket, next) {
  const token =
    socket.handshake.auth?.token ||
    socket.handshake.headers?.cookie?.split('accessToken=')?.[1]?.split(';')?.[0];

  if (!token) {
    return next(new Error('Access token manquant'));
  }

  try {
    const payload = verifyAccessToken(token);
    socket.user = { id: payload.userId, role: payload.role };
    next();
  } catch (error) {
    next(new Error('Token invalide ou expiré'));
  }
}
