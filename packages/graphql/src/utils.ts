import { DocumentNode, OperationDefinitionNode, print } from 'graphql';

import { GqlDocument, GqlRequest, GqlVariables } from './types';
import { isNode } from 'graphql/language/ast';

// Utils
export function gqlDoc<D, V extends GqlVariables = GqlVariables>(doc: string | DocumentNode): GqlDocument<D, V> {
  return doc;
}

export function buildRequest<D, V extends GqlVariables>(document: GqlDocument<D, V> | GqlRequest<D, V>): GqlRequest<D, V> {
  // Raw request
  if (typeof document === 'string') {
    return { query: document };
  }

  // Already printed request
  if (!isNode(document)) {
    return document;
  }

  // Print request
  const query = print(document);
  const operations = document.definitions
    .filter((def) => def.kind === 'OperationDefinition') as OperationDefinitionNode[];

  if (operations.length === 1) {
    return { query, operationName: operations[0].name?.value };
  }

  return { query };
}