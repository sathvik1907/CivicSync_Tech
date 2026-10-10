import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';
import { User } from '../models/User.js';

export const AUTH_COOKIE_NAME = 'civicsync_token';

/**
 * Generates a signed JWT with 30-minute expiry and strict issuer/audience.
 */
export function generateToken(user) {
  return jwt.sign(
    {
      sub: user._id.toString(),
      role: user.role
    },
    config.jwtSecret,
    {
      expiresIn: '30m',
      issuer: config.jwtIssuer,
      audience: config.jwtAudience
    }
  );
}

/**
 * Middleware: Verifies JWT from HttpOnly cookie and loads active user from MongoDB.
 */
export async function authenticate(req, res, next) {
  try {
    const token = req.cookies?.[AUTH_COOKIE_NAME];
    
    if (!token) {
      return res.status(401).json({
        code: 'UNAUTHORIZED',
        message: 'Authentication required. Please sign in.'
      });
    }

    let payload;
    try {
      payload = jwt.verify(token, config.jwtSecret, {
        issuer: config.jwtIssuer,
        audience: config.jwtAudience
      });
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
          code: 'TOKEN_EXPIRED',
          message: 'Your session has expired. Please sign in again.'
        });
      }
      return res.status(401).json({
        code: 'INVALID_TOKEN',
        message: 'Invalid session token.'
      });
    }

    // Always fetch fresh active user state from MongoDB
    const user = await User.findById(payload.sub).populate('department');
    if (!user || !user.active) {
      return res.status(401).json({
        code: 'ACCOUNT_INACTIVE',
        message: 'Account is inactive or not found.'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
}

/**
 * Middleware: Optional authentication (attaches user if present, continues if not)
 */
export async function optionalAuthenticate(req, res, next) {
  try {
    const token = req.cookies?.[AUTH_COOKIE_NAME];
    if (token) {
      try {
        const payload = jwt.verify(token, config.jwtSecret, {
          issuer: config.jwtIssuer,
          audience: config.jwtAudience
        });
        const user = await User.findById(payload.sub).populate('department');
        if (user && user.active) {
          req.user = user;
        }
      } catch {
        // Token invalid/expired - continue as anonymous
      }
    }
    next();
  } catch {
    next();
  }
}

/**
 * Middleware: Require one or more specific roles.
 */
export function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        code: 'UNAUTHORIZED',
        message: 'Authentication required.'
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        code: 'FORBIDDEN',
        message: `Forbidden: requires one of the following roles: ${allowedRoles.join(', ')}`
      });
    }

    next();
  };
}

/**
 * Middleware: Require official role (officer or coordinator)
 */
export const requireOfficial = requireRole('officer', 'coordinator');

/**
 * Middleware: Require coordinator role
 */
export const requireCoordinator = requireRole('coordinator');
