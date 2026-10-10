import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '9000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  mongoUri: process.env.MONGODB_URI || 'mongodb+srv://sathvik1907:sathvik123@civicsync-cluster.mwoxqbh.mongodb.net/?appName=civicsync-cluster',
  jwtSecret: process.env.JWT_SECRET || 'civicsync_super_secret_jwt_key_local_development_2026_secure',
  jwtIssuer: process.env.JWT_ISSUER || 'civicsync.local',
  jwtAudience: process.env.JWT_AUDIENCE || 'civicsync.users',
  cookieSecure: process.env.COOKIE_SECURE === 'true' || process.env.NODE_ENV === 'production',
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
