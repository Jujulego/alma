import { DocumentNode, OperationDefinitionNode, print } from 'graphql';

// Types
export type GraphqlDocument = string | DocumentNode;

export interface GraphqlRequest {
  query: string;
  operationName?: string;
}

// Utils
export function buildRequest(document: GraphqlDocument): GraphqlRequest {
  if (typeof document === 'string') {
    return { query: document };
  }

  const query = print(document);
  const operations = document.definitions
    .filter((def) => def.kind === 'OperationDefinition') as OperationDefinitionNode[];

  if (operations.length === 1) {
    return { query, operationName: operations[0].name?.value };
  }

  return { query };
}