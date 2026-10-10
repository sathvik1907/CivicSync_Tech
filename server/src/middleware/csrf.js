import crypto from 'crypto';

export const CSRF_COOKIE_NAME = 'civicsync_csrf';

/**
 * Generates a random CSRF token string.
 */
export function generateCsrfToken() {
  return crypto.randomBytes(24).toString('hex');
}

/**
 * Middleware: Verifies CSRF token for state-changing HTTP requests.
 * Exempts GET, HEAD, OPTIONS.
 */
export function verifyCsrf(req, res, next) {
  const method = req.method.toUpperCase();
  if (['GET', 'HEAD', 'OPTIONS'].includes(method)) {
    return next();
  }

  const cookieToken = req.cookies?.[CSRF_COOKIE_NAME];
  const headerToken = req.headers['x-csrf-token'];

  // Check origin/referrer if present
  const origin = req.headers.origin || req.headers.referer;
  if (process.env.NODE_ENV === 'production' && origin) {
    try {
      const originHost = new URL(origin).host;
      const serverHost = req.headers.host;
      if (originHost !== serverHost) {
        return res.status(403).json({
          code: 'CSRF_ORIGIN_MISMATCH',
          message: 'Origin header does not match expected host.'
        });
      }
    } catch {
      // Ignore URL parse errors in development
    }
  }

  if (!cookieToken || !headerToken || cookieToken !== headerToken) {
    return res.status(403).json({
      code: 'CSRF_TOKEN_INVALID',
      message: 'CSRF token is missing or invalid. Please refresh and try again.'
    });
  }

  next();
}
