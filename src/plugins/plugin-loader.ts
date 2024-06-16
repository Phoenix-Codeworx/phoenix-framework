import { Container } from 'typedi';
import { GraphQLSchema } from 'graphql';
import { buildSchema, type NonEmptyArray } from 'type-graphql';
import { readdirSync, statSync } from 'fs';
import { join } from 'path';
import logger from '../config/logger';
import mongoose, { Schema } from 'mongoose';
import { type GlobalContext } from './global-context';
import { type Plugin } from './plugin-interface';
import pluginsList from './plugins-list';

const loggerCtx = { context: 'plugin-loader' };

class PluginLoader {
  private plugins: Plugin[] = [];
  context: GlobalContext = {
    models: {},
    resolvers: {},
    extendModel: (name: string, extension: (schema: Schema) => void) => {
      if (!this.context.models[name]) {
        throw new Error(`Model ${name} does not exist`);
      }
      extension(this.context.models[name].schema);
    },
    extendResolvers: (name: string, extension: Function[]) => {
      if (!this.context.resolvers[name]) {
        this.context.resolvers[name] = [];
      }
      this.context.resolvers[name].push(...extension);
    },
    wrapResolver: (typeName: string, resolverName: string, wrapper: Function) => {
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
    },
  };

  loadPlugins() {
    const pluginsDir = join(__dirname, '.');
    pluginsList.forEach((pluginName) => {
      const pluginPath = join(pluginsDir, pluginName);
      if (statSync(pluginPath).isDirectory()) {
        try {
          const plugin: Plugin = require(`./${pluginName}`).default;
          if (!plugin) {
            throw new Error(`Plugin in directory ${pluginName} does not have a default export`);
          }
          logger.info(`Loaded plugin: ${plugin.name} of type ${plugin.type}`, loggerCtx);
          this.plugins.push(plugin);
          if (plugin.register) {
            plugin.register(Container, this.context);
            logger.debug(`Registered plugin: ${plugin.name}`, loggerCtx);
          }
        } catch (error) {
          console.error(`Failed to load plugin from directory ${pluginName}:`, error);
        }
      }
    });
  }

  initializePlugins() {
    this.plugins.forEach((plugin) => {
      try {
        if (plugin.initialize) {
          plugin.initialize(this.context);
          logger.info(`Initialized plugin: ${plugin.name}`, loggerCtx);
        }
      } catch (error) {
        logger.error(`Failed to initialize plugin ${plugin.name}: ${error}`, loggerCtx);
      }
    });
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
      });
    } catch (error) {
      logger.error(`Error building schema: ${error}`, loggerCtx);
      throw error;
    }
  }

  registerModels() {
    Object.keys(this.context.models).forEach((modelName) => {
      mongoose.model(modelName, this.context.models[modelName].schema);
    });
  }
}

export default PluginLoader;
