import { GraphQLSchema, GraphQLObjectType } from 'graphql';
import { Container } from 'typedi';
import type { Plugin } from './plugin';

export class PluginLoader {
  private plugins: Plugin[] = [];

  load(plugin: Plugin) {
    this.plugins.push(plugin);
    plugin.register(Container); // Pass Container as an argument
    plugin.registerEventHandlers(); // Register event handlers
  }

  createSchema() {
    const queryFields: any = {};
    const mutationFields: any = {};

    this.plugins.forEach(plugin => {
      const resolver = plugin.getResolver();
      if (resolver.query) {
        Object.assign(queryFields, resolver.query);
      }
      if (resolver.mutation) {
        Object.assign(mutationFields, resolver.mutation);
      }
    });

    const query = new GraphQLObjectType({
      name: 'Query',
      fields: queryFields,
    });

    const mutation = new GraphQLObjectType({
      name: 'Mutation',
      fields: mutationFields,
    });

    return new GraphQLSchema({
      query,
      mutation,
    });
  }

  getSchema() {
    return this.createSchema();
  }
}
