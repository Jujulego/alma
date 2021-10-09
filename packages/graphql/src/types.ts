import { DocumentNode } from 'graphql';

// Types
export type GqlVariables = Record<string, unknown>;
export type GqlDocument<D = unknown, V extends GqlVariables = GqlVariables> = (string | DocumentNode) & { _d?: D, _v?: V };

export interface GqlRequest<D = unknown, V extends GqlVariables = GqlVariables> {
  _d?: D,
  query: string;
  operationName?: string;
  variables?: V;
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

export interface GqlResponse<D> {
  data: D;
  errors?: GqlError[];
}

export interface GqlErrorResponse {
  errors: GqlError[];
}

export interface GqlState<D> {
  loading: boolean;
  data?: D;
  error?: GqlErrorResponse;
}
