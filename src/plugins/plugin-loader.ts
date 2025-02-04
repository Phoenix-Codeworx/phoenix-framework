import { Container } from 'typedi';
import { GraphQLSchema } from 'graphql';
import { buildSchema, type NonEmptyArray } from 'type-graphql';
import { statSync } from 'fs';
import path, { join } from 'path';
import logger from '../config/logger';
import mongoose, { Schema } from 'mongoose';
import { type GlobalContext } from './global-context';
import { type Plugin } from './plugin-interface';
import pluginsList from './plugins-list';
import { Queue, Worker, QueueEvents, type WorkerOptions } from 'bullmq';
import env from '../config/config';

const loggerCtx = { context: 'plugin-loader' };

class PluginLoader {
  private plugins: Plugin[] = [];
  context: GlobalContext = this.createInitialContext();
  private queues: Record<string, Queue> = {};

  private createInitialContext(): GlobalContext {
    return {
      models: {},
      resolvers: {},
      extendModel: this.extendModel.bind(this),
      extendResolvers: this.extendResolvers.bind(this),
      wrapResolver: this.wrapResolver.bind(this),
      queues: {}
    };
  }

  private extendModel(name: string, extension: (schema: Schema) => void): void {
    const model = this.context.models[name];
    if (!model) {
      throw new Error(`Model ${name} does not exist`);
    }
    extension(model.schema);
  }

  private extendResolvers(name: string, extension: Function[]): void {
    if (!this.context.resolvers[name]) {
      this.context.resolvers[name] = [];
    }
    this.context.resolvers[name].push(...extension);
  }

  private wrapResolver(typeName: string, resolverName: string, wrapper: Function): void {
    const resolverArray = this.context.resolvers[typeName];
    if (!resolverArray) {
      throw new Error(`Resolvers for type ${typeName} do not exist`);
    }

    logger.debug(`Resolving ${resolverName} in type ${typeName}`, loggerCtx);

    const originalResolverIndex = resolverArray.findIndex((resolver: any) => resolver.prototype[resolverName]);
    if (originalResolverIndex === -1) {
      throw new Error(`Resolver ${resolverName} for type ${typeName} does not exist`);
    }
    const originalResolver = resolverArray[originalResolverIndex].prototype[resolverName];
    resolverArray[originalResolverIndex].prototype[resolverName] = wrapper(originalResolver);
  }

  loadPlugins(): void {
    pluginsList.forEach(this.loadPlugin.bind(this));
  }

  private loadPlugin(pluginName: string): void {
    const pluginPath = join(__dirname, pluginName);
    if (!statSync(pluginPath).isDirectory()) return;

    try {
      const plugin: Plugin = require(`./${pluginName}`).default;
      if (!plugin) {
        throw new Error(`Plugin in directory ${pluginName} does not have a default export`);
      }
      logger.info(`Loaded plugin: ${plugin.name} of type ${plugin.type}`, loggerCtx);
      this.plugins.push(plugin);
      plugin.register?.(Container, this.context);
      logger.debug(`Registered plugin: ${plugin.name}`, loggerCtx);
    } catch (error) {
      console.error(`Failed to load plugin from directory ${pluginName}:`, error);
    }
  }

  initializePlugins(): void {
    this.plugins.forEach(this.initializePlugin.bind(this));
  }

  private initializePlugin(plugin: Plugin): void {
    try {
      plugin.initialize?.(this.context);
      logger.info(`Initialized plugin: ${plugin.name}`, loggerCtx);
    } catch (error) {
      logger.error(`Failed to initialize plugin ${plugin.name}: ${error}`, loggerCtx);
    }
  }

  async createSchema(): Promise<GraphQLSchema> {
    const allResolvers = Object.values(this.context.resolvers).flat();
    if (allResolvers.length === 0) {
      throw new Error('No resolvers found. Please ensure at least one resolver is provided.');
    }

    try {
      return await buildSchema({
        resolvers: allResolvers as unknown as NonEmptyArray<Function>,
        container: Container,
        emitSchemaFile: path.resolve(__dirname, '../../schema.graphql'),
      });
    } catch (error) {
      logger.error(`Error building schema: ${error}`, loggerCtx);
      throw error;
    }
  }

  registerModels(): void {
    Object.keys(this.context.models).forEach((modelName) => {
      mongoose.model(modelName, this.context.models[modelName].schema);
    });
  }

  initializeQueues(): void {
    Object.keys(this.context.queues).forEach((queueName) => {
      const { processor, options } = this.context.queues[queueName];
      const queue = new Queue(queueName, options);
      const worker = new Worker(queueName, processor, options);
      const queueEvents = new QueueEvents(queueName, options);

      queueEvents.on('completed', (job) => {
        logger.info(`Job ${job.jobId} in queue ${queueName} completed!`, loggerCtx);
      });

      queueEvents.on('failed', (job, err) => {
        const errorMessage = this.extractErrorMessage(err);
        logger.error(`Job ${job.jobId} in queue ${queueName} failed with error: ${errorMessage}`, loggerCtx);;
      });

      this.queues[queueName] = queue;
    });
  }

  private extractErrorMessage(err: unknown): string {
    if (typeof err === 'string') {
      return err;
    }
    if (err instanceof Error) {
      return err.message;
    }
    return JSON.stringify(err);
  }
}

export default PluginLoader;
