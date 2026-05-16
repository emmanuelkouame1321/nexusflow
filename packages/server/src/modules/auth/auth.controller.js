import * as authService from './auth.service.js';

/**
 * POST /auth/register (admin seulement)
 */
export async function register(req, res, next) {
  try {
    const { firstName, lastName, email, password, roleId } = req.body;
    const user = await authService.createUser({ firstName, lastName, email, password, roleId });
    return res.status(201).json({ user: { id: user.id, email: user.email, role: user.role.name } });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /auth/login
 */
export async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const user = await authService.getUserByEmail(email);
    if (!user || !(await authService.comparePassword(password, user.passwordHash))) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
    }

    const accessToken = authService.generateAccessToken(user);
    const refreshToken = authService.generateRefreshToken(user);
    await authService.saveRefreshToken(user.id, refreshToken);

    // Cookies httpOnly
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 jours
    });

    // res.cookie('accessToken', accessToken, {
    // httpOnly: true,
    // secure: false,           // false en développement (pas de HTTPS)
    // sameSite: 'lax',         // plus permissif que strict
    // maxAge: 15 * 60 * 1000,
    // });

    // res.cookie('refreshToken', refreshToken, {
    // httpOnly: true,
    // secure: false,
    // sameSite: 'lax',
    // maxAge: 7 * 24 * 60 * 60 * 1000,
    // });

    return res.json({ user: { id: user.id, email: user.email, role: user.role.name } });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /auth/refresh
 */
export async function refresh(req, res, next) {
  try {
    const token = req.cookies.refreshToken;
    if (!token) {
      return res.status(401).json({ message: 'Refresh token manquant' });
    }

    const payload = authService.verifyRefreshToken(token);
    const user = await authService.getUserById(payload.userId);
    if (!user || user.refreshToken !== token) {
      return res.status(401).json({ message: 'Refresh token invalide' });
    }

    const newAccessToken = authService.generateAccessToken(user);
    res.cookie('accessToken', newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000,
    });

    return res.json({ message: 'Token rafraîchi' });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /auth/logout
 */
export async function logout(req, res, next) {
  try {
    await authService.removeRefreshToken(req.user.id);
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    return res.json({ message: 'Déconnecté' });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /auth/me
 */
export async function getMe(req, res, next) {
  try {
    const user = await authService.getUserById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur introuvable' });
    }
    return res.json({ user: { id: user.id, email: user.email, role: user.role.name } });
  } catch (error) {
    next(error);
  }
}
