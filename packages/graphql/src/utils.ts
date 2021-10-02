import { OperationDefinitionNode, print } from 'graphql';

import { GqlDocument, GqlErrorResponse, GqlRequest, GqlResponse } from './types';

// Utils
export function buildRequest(document: GqlDocument): GqlRequest {
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