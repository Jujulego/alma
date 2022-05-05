import { DocumentNode, OperationDefinitionNode, print } from 'packages/graphql/src/gql';
import { isNode } from 'graphql/language/ast';
import _gql from 'graphql-tag';

import { GqlRequest, GqlVars } from '../types';

// Types
export type GqlDoc<V extends GqlVars = GqlVars> = (string | DocumentNode) & {
  __vars?: V;
};

// Utils
export const gql = _gql as <V extends GqlVars = GqlVars>(literals: TemplateStringsArray, ...args: unknown[]) => DocumentNode & { __vars?: V; };

export function buildRequest<V extends GqlVars = GqlVars>(document: GqlDoc<V> | GqlRequest<V>): GqlRequest<V> {
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
    .filter((def): def is OperationDefinitionNode => def.kind === 'OperationDefinition');

  if (operations.length === 1) {
    return { query, operationName: operations[0].name?.value };
  }

  return { query };
}
