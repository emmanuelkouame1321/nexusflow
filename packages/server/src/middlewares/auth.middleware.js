import { verifyAccessToken } from '../modules/auth/auth.service.js';

export function authenticate(req, res, next) {
  const token = req.cookies.accessToken;
  if (!token) {
    return res.status(401).json({ message: 'Access token manquant' });
  }

  try {
    const payload = verifyAccessToken(token);
    req.user = { id: payload.userId, role: payload.role };
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Access token invalide ou expiré' });
  }
}
