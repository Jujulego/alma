import { DocumentNode, GraphQLError } from 'graphql';
import { ApiPromise } from '../../api';

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
  data?: D;
  errors?: ReadonlyArray<GraphQLError>;
}

export interface GqlSink<D> {
  onData: (data: GqlResponse<D>) => void;
  onError: (error: unknown) => void;
}

// Hooks
export interface GqlQueryHookState<D, V extends GqlVariables> {
  loading: boolean;
  send: (vars: V) => ApiPromise<GqlResponse<D>>;
}

export type GqlQueryHook<D, V extends GqlVariables> = (url: string, req: GqlRequest<D, V>) => GqlQueryHookState<D, V>;

export interface GqlSubscribeHookState<D, V extends GqlVariables> {
  loading: boolean;
  subscribe: (vars: V, sink: GqlSink<D>) => GqlCancel;
}

export type GqlSubscribeHook<D, V extends GqlVariables> = (url: string, req: GqlRequest<D, V>) => GqlSubscribeHookState<D, V>;
