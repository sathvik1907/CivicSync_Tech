import { app } from './app.js';
import { connectDB } from './config/db.js';
import { config } from './config/env.js';

async function startServer() {
  try {
    console.log(`[TransparanceCity] Initializing server in ${config.nodeEnv} mode...`);
    if (!config.mongoUri) {
      throw new Error('MONGODB_URI is missing. Create server/.env from server/.env.example and set the Atlas or local MongoDB URI.');
    }
    await connectDB();

    const server = await new Promise((resolve, reject) => {
      const listener = app.listen(config.port, () => resolve(listener));
      listener.once('error', reject);
    });

    console.log(`[TransparanceCity] Server listening on port ${config.port}`);
    console.log(`[TransparanceCity] Health check: http://localhost:${config.port}/health/ready`);
    console.log(`[TransparanceCity] API Base: http://localhost:${config.port}/api/v1`);
    return server;
  } catch (error) {
    if (error.code === 'EADDRINUSE') {
      console.error(`[TransparanceCity] Port ${config.port} is already in use. Stop the existing server or configure a different PORT.`);
    } else {
      console.error(`[TransparanceCity] Fatal startup error: ${error.message}`);
    }
    process.exit(1);
  }
}

startServer();
