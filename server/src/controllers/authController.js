import { registerResident, login } from '../services/authService.js';
import { generateToken, AUTH_COOKIE_NAME } from '../middleware/auth.js';
import { generateCsrfToken, CSRF_COOKIE_NAME } from '../middleware/csrf.js';
import { config } from '../config/env.js';
import { User } from '../models/User.js';

export async function listLocalDemoAccounts(req, res, next) {
  if (config.nodeEnv === 'production' || !config.demoMode) {
    return res.status(404).json({ code: 'NOT_FOUND', message: 'Not found.' });
  }

  try {
    const users = await User.find({ isDemoAccount: true, active: true })
      .select('emailNormalized displayName role department')
      .populate('department', 'code name')
      .sort({ role: 1, emailNormalized: 1 })
      .lean();

    res.set('Cache-Control', 'no-store');
    res.json({
      accounts: users.map((user) => ({
        email: user.emailNormalized,
        displayName: user.displayName,
        role: user.role,
        department: user.department
          ? { code: user.department.code, name: user.department.name }
          : null
      }))
    });
  } catch (error) {
    next(error);
  }
}

export async function getCsrfToken(req, res) {
  const token = generateCsrfToken();
  res.cookie(CSRF_COOKIE_NAME, token, {
    httpOnly: false, // Accessible to JavaScript so client can send in X-CSRF-Token header
    secure: config.cookieSecure,
    sameSite: 'lax',
    path: '/'
  });
  res.json({ csrfToken: token });
}

export async function register(req, res, next) {
  try {
    const user = await registerResident(req.body);
    const token = generateToken(user);

    res.cookie(AUTH_COOKIE_NAME, token, {
      httpOnly: true,
      secure: config.cookieSecure,
      sameSite: 'lax',
      maxAge: 30 * 60 * 1000, // 30 minutes
      path: '/'
    });

    res.status(201).json({
      user: user.toSafeJSON()
    });
  } catch (error) {
    next(error);
  }
}

export async function loginUser(req, res, next) {
  try {
    const user = await login(req.body);
    const token = generateToken(user);

    res.cookie(AUTH_COOKIE_NAME, token, {
      httpOnly: true,
      secure: config.cookieSecure,
      sameSite: 'lax',
      maxAge: 30 * 60 * 1000, // 30 minutes
      path: '/'
    });

    res.json({
      user: user.toSafeJSON()
    });
  } catch (error) {
    next(error);
  }
}

export function logout(req, res) {
  res.clearCookie(AUTH_COOKIE_NAME, {
    httpOnly: true,
    secure: config.cookieSecure,
    sameSite: 'lax',
    path: '/'
  });
  res.json({ message: 'Signed out successfully.' });
}

export function getMe(req, res) {
  if (!req.user) {
    return res.json({ user: null });
  }
  res.json({ user: req.user.toSafeJSON() });
}
