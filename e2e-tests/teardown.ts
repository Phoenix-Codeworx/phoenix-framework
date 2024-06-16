// e2e-tests/teardown.ts
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongoServer: MongoMemoryServer;

export const setMongoServer = (server: MongoMemoryServer) => {
  mongoServer = server;
};

export const teardown = async () => {
  await mongoose.disconnect();
  if (mongoServer) {
    await mongoServer.stop();
  }
};
