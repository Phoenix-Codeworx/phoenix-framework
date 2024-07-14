import type { Container } from 'typedi';
import type { GraphQLSchema, GraphQLFieldConfigMap } from 'graphql';

export interface Plugin {
  register(container: typeof Container): void;
  registerResolvers(schema: GraphQLSchema): void;
  registerEventHandlers(): void;
  getResolver(): {
    query?: GraphQLFieldConfigMap<any, any>;
    mutation?: GraphQLFieldConfigMap<any, any>;
  };
}
