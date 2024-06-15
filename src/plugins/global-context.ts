import { Schema } from 'mongoose';

export interface GlobalContext {
  models: { [key: string]: { schema: Schema, model: any } };
  resolvers: { [key: string]: Function[] };
  extendModel: (name: string, extension: (schema: Schema) => void) => void;
  extendResolvers: (name: string, extension: Function[]) => void;
}
