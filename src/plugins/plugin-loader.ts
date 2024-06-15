import { Container } from 'typedi';
import { GraphQLSchema } from 'graphql';
import { buildSchema, type NonEmptyArray } from 'type-graphql';
import { readdirSync, statSync } from 'fs';
import { join } from 'path';
import logger from '../config/logger';
import mongoose, { Schema } from 'mongoose';
import { type GlobalContext } from './global-context';

interface Plugin {
  name: string;
  type: string;
  resolvers?: Function[];
  register?: (container: typeof Container, context: GlobalContext) => void;
  initialize?: (context: GlobalContext) => void;
}

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
    }
  };

  loadPlugins() {
    const pluginsDir = join(__dirname, '.');
    const pluginDirs = readdirSync(pluginsDir).filter((file) => {
      const stat = statSync(join(pluginsDir, file));
      return stat.isDirectory();
    });

    pluginDirs.forEach((dir) => {
      try {
        const plugin: Plugin = require(`./${dir}`).default;
        if (!plugin) {
          throw new Error(`Plugin in directory ${dir} does not have a default export`);
        }
        logger.info(`Loaded plugin: ${plugin.name} of type ${plugin.type}`);
        this.plugins.push(plugin);
        if (plugin.register) {
          plugin.register(Container, this.context);
        }
      } catch (error) {
        console.error(`Failed to load plugin from directory ${dir}:`, error);
      }
    });
  }

  initializePlugins() {
    this.plugins.forEach(plugin => {
      try {
        if (plugin.initialize) {
          plugin.initialize(this.context);
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

    return buildSchema({
      resolvers: allResolvers as NonEmptyArray<Function>,
      container: Container,
    });
  }

  registerModels() {
    Object.keys(this.context.models).forEach(modelName => {
      mongoose.model(modelName, this.context.models[modelName].schema);
    });
  }
}

export default PluginLoader;
