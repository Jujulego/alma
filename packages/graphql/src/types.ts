import { ApiPromise, Updator } from '@jujulego/alma-api';
import { DocumentNode } from 'graphql';

// Types
export type GqlDocument = string | DocumentNode;
export type GqlVariables = Record<string, unknown>;

export interface GqlRequest {
  query: string;
  operationName?: string;
  variables?: GqlVariables;
}

export interface GqlLocation {
  column: number;
  line: number;
}

export interface GqlError {
  message: string;
  locations: GqlLocation[];
  path?: string[];
  extensions?: unknown;
}

export interface GqlResponse<R> {
  data: R;
  errors?: GqlError[];
}

export interface GqlErrorResponse {
  errors: GqlError[];
}

export interface GqlQueryReturn<R> {
  loading: boolean;
  data?: R;
  error?: GqlErrorResponse;

  update: (data: R | Updator<R>) => void;
  reload: () => void;
}

export interface GqlMutationReturn<V extends GqlVariables, R> {
  loading: boolean;
  data?: R;
  error?: GqlErrorResponse;

  send: (vars: V) => ApiPromise<R>;
}
