import { app } from './app.js';
import { connectDB } from './config/db.js';
import { config } from './config/env.js';

async function startServer() {
  try {
    console.log(`[CivicSync] Initializing server in ${config.nodeEnv} mode...`);
    await connectDB();

    app.listen(config.port, () => {
      console.log(`[CivicSync] Server listening on port ${process.env.port}`);
      console.log(`[CivicSync] Health check: http://localhost:${config.port}/health/ready`);
      console.log(`[CivicSync] API Base: http://localhost:${config.port}/api/v1`);
    });
  } catch (error) {
    console.error(`[CivicSync] Fatal startup error: ${error.message}`);
    process.exit(1);
  }
}

startServer();
