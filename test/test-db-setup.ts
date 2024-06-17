import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import logger from '../src/config/logger';

let mongoServer: MongoMemoryServer;
const loggerCtx = { context: 'test-db-setup' };

async function connectDB() {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();

  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 5000, // 5 seconds timeout for MongoDB server selection
  });
  mongoose.set('bufferCommands', false);
  logger.info('MongoDB connected');
}

async function closeDB() {
  await mongoose.disconnect();
  await mongoServer.stop();
  logger.info('MongoDB disconnected', loggerCtx);
}

export { connectDB, closeDB };
