import { DocumentNode, GraphQLError } from 'graphql';

// Types
export type GqlVariables = Record<string, unknown>;
export type GqlDocument<D = unknown, V extends GqlVariables = GqlVariables> = (string | DocumentNode) & { _d?: D, _v?: V };
export type GqlCancel = () => void;

export interface GqlRequest<D = unknown, V extends GqlVariables = GqlVariables> {
  _d?: D,
  query: string;
  operationName?: string;
  variables?: V;
}

export interface GqlResponse<D> {
  data: D;
  errors?: ReadonlyArray<GraphQLError>;
}

export interface GqlErrorResponse {
  data?: undefined;
  errors: ReadonlyArray<GraphQLError>;
}

export interface GqlSink<D> {
  onData: (data: GqlResponse<D>) => void;
  onError: (error: unknown) => void;
}
