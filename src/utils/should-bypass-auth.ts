import { type OperationDefinitionNode, parse } from 'graphql';
import excludedOperations from '../config/excluded-operations';

export function shouldBypassAuth(query: string): boolean {
  try {
    const parsedQuery = parse(query);
    const operationDefinitions = parsedQuery.definitions.filter(
      (def) => def.kind === 'OperationDefinition',
    ) as OperationDefinitionNode[];

    return operationDefinitions.some((def) => {
      const operationType = def.operation;
      const firstSelection = def.selectionSet.selections[0];
      if (firstSelection.kind === 'Field') {
        const operationName = (firstSelection as any).name.value;

        // Define the operations that should bypass authentication
        const bypassAuthOperations = excludedOperations;

        return bypassAuthOperations.some((op) => op.type === operationType && op.name === operationName);
      }
      return false;
    });
  } catch (error) {
    console.error('Error parsing GraphQL query:', error);
    return false;
  }
}
