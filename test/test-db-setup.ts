import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongoServer: MongoMemoryServer;

async function connectDB() {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();

  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 5000, // 5 seconds timeout for MongoDB server selection
  });
  mongoose.set('bufferCommands', false);
  console.log('MongoDB connected');
}

async function closeDB() {
  await mongoose.disconnect();
  await mongoServer.stop();
  console.log('MongoDB disconnected');
}

export { connectDB, closeDB };
