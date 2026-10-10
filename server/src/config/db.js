import mongoose from 'mongoose';
import { config } from './env.js';

let isConnected = false;

export async function connectDB() {
  if (isConnected && mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  try {
    const conn = await mongoose.connect(config.mongoUri, {
      serverSelectionTimeoutMS: 5000,
    });
    isConnected = true;
    console.log(`[MongoDB] Connected successfully: ${conn.connection.host}/${conn.connection.name}`);
    return conn.connection;
  } catch (error) {
    console.error(`[MongoDB] Connection error: ${error.message}`);
    isConnected = false;
    throw error;
  }
}

export function isDBReady() {
  return mongoose.connection.readyState === 1;
}

export async function disconnectDB() {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
    isConnected = false;
  }
}
