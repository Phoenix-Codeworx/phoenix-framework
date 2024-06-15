import { parse, type OperationDefinitionNode, type DocumentNode } from 'graphql';
import logger from '../config/logger.ts';

export function isIntrospectionQuery(query: string): boolean {
  try {
    const parsedQuery: DocumentNode = parse(query);
    const operationDefinitions = parsedQuery.definitions.filter(
      (def) => def.kind === 'OperationDefinition',
    ) as OperationDefinitionNode[];

    return operationDefinitions.some((def) => {
      return def.selectionSet.selections.some((selection) => {
        if (selection.kind === 'Field') {
          const fieldName = (selection as any).name.value;
          const isIntrospectionQuery = fieldName === '__schema' || fieldName === '__type';
          return isIntrospectionQuery;
        }
        logger.debug('isIntrospectionQuery: false');
        return false;
      });
    });
  } catch (error) {
    logger.error('Error parsing GraphQL query:', error);
    return false;
  }
}
