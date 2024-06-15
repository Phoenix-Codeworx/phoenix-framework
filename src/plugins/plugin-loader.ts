import { Container } from 'typedi';
import { GraphQLSchema } from 'graphql';
import { buildSchema, type NonEmptyArray } from 'type-graphql';
import { readdirSync, statSync } from 'fs';
import { join } from 'path';
import logger from '../config/logger';
import mongoose, { Schema } from 'mongoose';
import { type GlobalContext, type ResolverMap } from './global-context';
import { type Plugin } from './plugin-interface';

class PluginLoader {
  private plugins: Plugin[] = [];
  private context: GlobalContext = {
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
      console.log(`Resolving ${resolverName} in type ${typeName}`); // Add logging
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

    // Explicitly load cart-plugin and discount-plugin first
    const specificPlugins = ['cart-plugin', 'discount-plugin'];
    specificPlugins.forEach((pluginName) => {
      const pluginPath = join(pluginsDir, pluginName);
      if (statSync(pluginPath).isDirectory()) {
        try {
          const plugin: Plugin = require(`./${pluginName}`).default;
          if (!plugin) {
            throw new Error(`Plugin in directory ${pluginName} does not have a default export`);
          }
          logger.info(`Loaded plugin: ${plugin.name} of type ${plugin.type}`);
          this.plugins.push(plugin);
          if (plugin.register) {
            plugin.register(Container, this.context);
            logger.info(`Registered plugin: ${plugin.name}`);
          }
        } catch (error) {
          console.error(`Failed to load plugin from directory ${pluginName}:`, error);
        }
      }
    });

    // Load other plugins in default order
    const otherPluginDirs = readdirSync(pluginsDir).filter((file) => {
      const stat = statSync(join(pluginsDir, file));
      return stat.isDirectory() && !specificPlugins.includes(file);
    });

    otherPluginDirs.forEach((dir) => {
      try {
        const plugin: Plugin = require(`./${dir}`).default;
        if (!plugin) {
          throw new Error(`Plugin in directory ${dir} does not have a default export`);
        }
        logger.info(`Loaded plugin: ${plugin.name} of type ${plugin.type}`);
        this.plugins.push(plugin);
        if (plugin.register) {
          plugin.register(Container, this.context);
          logger.info(`Registered plugin: ${plugin.name}`);
        }
      } catch (error) {
        console.error(`Failed to load plugin from directory ${dir}:`, error);
      }
    });
  }

  initializePlugins() {
    this.plugins.forEach((plugin) => {
      try {
        if (plugin.initialize) {
          plugin.initialize(this.context);
          logger.info(`Initialized plugin: ${plugin.name}`);
        }
      } catch (error) {
        console.error(`Failed to initialize plugin ${plugin.name}:`, error);
      }
    });
  }

  async createSchema(): Promise<GraphQLSchema> {
    const allResolvers = Object.values(this.context.resolvers).flat();
    if (allResolvers.length === 0) {
      throw new Error('No resolvers found. Please ensure at least one resolver is provided.');
    }

    console.log('Flat Resolvers:', allResolvers); // Add logging

    try {
      return await buildSchema({
        resolvers: allResolvers as unknown as NonEmptyArray<Function>,
        container: Container,
      });
    } catch (error) {
      console.error('Error building schema:', error);
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
