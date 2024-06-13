import 'reflect-metadata';
import { buildSchema } from 'type-graphql';
import { Container } from 'typedi';
import { UserResolver } from '../plugins/user-plugin/resolvers/user-resolver';

export async function createSchema() {
  return buildSchema({
    resolvers: [UserResolver],
    container: Container, // Use TypeDI container
    emitSchemaFile: true, // Optional: generates a schema.graphql file
  });
}
