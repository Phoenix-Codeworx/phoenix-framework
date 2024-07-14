import { Schema } from 'mongoose';
import { type WorkerOptions } from 'bullmq';

export type ResolverMap = {
  [resolverName: string]: Function;
};

export interface GlobalContext {
  models: { [key: string]: { schema: Schema; model: any } };
  resolvers: { [key: string]: Function[] };
  services: { [key: string]: any };
  extendModel: (name: string, extension: (schema: Schema) => void) => void;
  extendResolvers: (name: string, extension: Function[]) => void;
  wrapResolver: (name: string, resolver: string, wrapper: Function) => void;
  queues: { [key: string]: { processor: (job: any) => Promise<void>; options: WorkerOptions } };
}
