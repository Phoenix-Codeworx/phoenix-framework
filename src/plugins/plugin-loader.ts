import { Container } from 'typedi';
import { GraphQLSchema } from 'graphql';
import { buildSchema, type NonEmptyArray } from 'type-graphql';
import { readdirSync, statSync } from 'fs';
import { join } from 'path';
import logger from '../config/logger';

export class PluginLoader {
  private plugins: any[] = [];

  loadPlugins() {
    const pluginsDir = join(__dirname, '.');
    const pluginDirs = readdirSync(pluginsDir).filter((file) => {
      const stat = statSync(join(pluginsDir, file));
      return stat.isDirectory();
    });

    pluginDirs.forEach((dir) => {
      try {
        const plugin = require(`./${dir}`).default;
        if (!plugin) {
          throw new Error(`Plugin in directory ${dir} does not have a default export`);
        }
        logger.info(`Loaded plugin: ${plugin.name} of type ${plugin.type}`);
        this.plugins.push(plugin);
        if (plugin.register) {
          plugin.register(Container);
        }
      } catch (error) {
        console.error(`Failed to load plugin from directory ${dir}:`, error);
      }
    });
  }

  async createSchema(): Promise<GraphQLSchema> {
    const resolvers = this.plugins.flatMap((plugin) => plugin.resolvers || []) as Function[];

    if (resolvers.length === 0) {
      throw new Error('No resolvers found. Please ensure at least one resolver is provided.');
    }

    return buildSchema({
      resolvers: resolvers as NonEmptyArray<Function>,
      container: Container,
    });
  }
}
