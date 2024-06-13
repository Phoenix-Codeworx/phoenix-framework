import mongoose from 'mongoose';
import env from './config';

export async function connectToDatabase() {
  const mongoUri = env.MONGO_URI;

  try {
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Error connecting to MongoDB', error);
    process.exit(1);
  }
}
