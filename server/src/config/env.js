import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { randomBytes } from 'crypto';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const nodeEnv = process.env.NODE_ENV || 'development';
const jwtSecret = process.env.JWT_SECRET;

if (nodeEnv === 'production' && !jwtSecret) {
  throw new Error('JWT_SECRET must be configured in production.');
}

if (nodeEnv !== 'production' && !jwtSecret) {
  console.warn('[TransparanceCity] JWT_SECRET is not set; using a temporary development-only secret. Sessions will end when the server restarts.');
}

export const config = {
  port: parseInt(process.env.PORT || '9000', 10),
  nodeEnv,
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  mongoUri: process.env.MONGODB_URI || null,
  jwtSecret: jwtSecret || randomBytes(32).toString('hex'),
  jwtIssuer: process.env.JWT_ISSUER || 'civicsync.local',
  jwtAudience: process.env.JWT_AUDIENCE || 'civicsync.users',
  cookieSecure: process.env.COOKIE_SECURE === 'true' || process.env.NODE_ENV === 'production',
  demoMode: nodeEnv !== 'production' && process.env.DEMO_MODE === 'true',
  demoAccountPassword: process.env.DEMO_ACCOUNT_PASSWORD || '',
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
    apiKey: process.env.CLOUDINARY_API_KEY || '',
    apiSecret: process.env.CLOUDINARY_API_SECRET || '',
    isConfigured: Boolean(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET)
  },
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
    max: parseInt(process.env.RATE_LIMIT_MAX || '200', 10)
  }
};
