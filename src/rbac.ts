import { newEnforcer, Enforcer } from 'casbin';
import { MongooseAdapter } from 'casbin-mongoose-adapter';
import mongoose from 'mongoose';
import path from 'path';
import env from '../src/config/config';

let enforcer: Enforcer;

export const initEnforcer = async (): Promise<void> => {
  // Connect to MongoDB
  await mongoose.connect(env.MONGO_URI, {});

  const adapter = await MongooseAdapter.newAdapter(env.MONGO_URI); // Use the connection string
  const modelPath = path.join(__dirname, '../config/rbac_model.conf'); // Corrected path to rbac_model.conf

  enforcer = await newEnforcer(modelPath, adapter);
  await enforcer.loadPolicy(); // Load the policy from the database
};

export const getEnforcer = (): Enforcer => {
  if (!enforcer) {
    throw new Error('Enforcer has not been initialized. Please call initEnforcer first.');
  }
  return enforcer;
};
