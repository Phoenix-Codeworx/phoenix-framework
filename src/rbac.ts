import { newEnforcer } from 'casbin';
import { MongooseAdapter } from 'casbin-mongoose-adapter';
import mongoose from 'mongoose';

let enforcer: any;

export const initEnforcer = async () => {
  const adapter = await MongooseAdapter.newAdapter('mongodb://root:example@localhost:27017/casbin?authSource=admin');
  enforcer = await newEnforcer('rbac_model.conf', adapter);
};

export const getEnforcer = () => enforcer;
