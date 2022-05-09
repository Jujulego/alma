import { ApiOptionsEffect, ApiOptionsSuspense, ApiOptions, $api } from '@jujulego/alma-api';
import { GraphQLError } from 'graphql';

import { GqlRequest, GqlResponse, GqlVars } from './types';
import { buildRequest, GqlDoc } from './utils';

// Types
export interface GqlOptions {
  url?: string;
}

export type GqlApiOptionsSuspense<V extends GqlVars> = GqlOptions & ApiOptionsSuspense<GqlRequest<V>, 'json'>;
export type GqlApiOptionsEffect<V extends GqlVars> = GqlOptions & ApiOptionsEffect<GqlRequest<V>, 'json'>;
export type GqlApiOptions<V extends GqlVars> = GqlOptions & ApiOptions<GqlRequest<V>, 'json'>;

export interface GqlHookState<D> {
  isLoading: boolean;
  errors: readonly GraphQLError[];
  data: D;
  setData: (data: D) => void;
}

export type GqlHook<D, V extends GqlVars = GqlVars> = (vars: V) => GqlHookState<D>;

// Hook builder
export function $gql<D, V extends GqlVars>(doc: GqlDoc<V>, options: GqlApiOptionsSuspense<V>): GqlHook<D, V>;
export function $gql<D, V extends GqlVars>(doc: GqlDoc<V>, options?: GqlApiOptionsEffect<V>): GqlHook<D | undefined, V>;
export function $gql<D, V extends GqlVars>(doc: GqlDoc<V>, options?: GqlApiOptions<V>): GqlHook<D | undefined, V>;

export function $gql<D, V extends GqlVars>(doc: GqlDoc<V>, options: GqlApiOptions<V> = {}): GqlHook<D | undefined, V> {
  const request = buildRequest(doc);

  // Options
  const { url = '/graphql' } = options;
  options.key ??= `gql:${url}:${request.operationName}`;

  // Hook
  const hook = $api<GqlResponse<D>, GqlRequest<V>, void>('post', url, options);

  return hook;
}
