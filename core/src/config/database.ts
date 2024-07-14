import mongoose from 'mongoose';
import logger from './logger';
import env from './config';

export async function connectToDatabase() {
  const mongoUri = env.MONGO_URI;

  try {
    await mongoose.connect(mongoUri);
    logger.info('Connected to MongoDB', { context: 'database' });
  } catch (error) {
    logger.error('Error connecting to MongoDB', { error, context: 'database' });
    process.exit(1);
  }
}
