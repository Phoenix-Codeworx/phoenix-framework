import { Schema } from 'mongoose';

export type ResolverMap = {
  [resolverName: string]: Function;
};

export interface GlobalContext {
  models: { [key: string]: { schema: Schema, model: any } };
  resolvers: { [key: string]: Function[] };
  extendModel: (name: string, extension: (schema: Schema) => void) => void;
  extendResolvers: (name: string, extension: Function[]) => void;
  wrapResolver: (name: string, resolver: string, wrapper: Function) => void;
}
