import { ApiOptionsEffect, ApiOptionsSuspense, ApiOptions, $api } from '@jujulego/alma-api';
import { useDeepMemo } from '@jujulego/alma-utils';
import { GraphQLError } from 'graphql';
import { useCallback, useMemo } from 'react';

import { GqlRequest, GqlResource, GqlResponse, GqlVars } from './types';
import { buildRequest, GqlDoc } from './utils';

// Types
export interface GqlOptions {
  url?: string;
}

export type GqlApiOptionsSuspense<V extends GqlVars> = GqlOptions & ApiOptionsSuspense<GqlRequest<V>, 'json'>;
export type GqlApiOptionsEffect<V extends GqlVars> = GqlOptions & ApiOptionsEffect<GqlRequest<V>, 'json'>;
export type GqlApiOptions<V extends GqlVars> = GqlOptions & ApiOptions<GqlRequest<V>, 'json'>;

export interface GqlHookState<D, Def = never> {
  isLoading: boolean;
  errors: readonly GraphQLError[];
  data: D | Def;
  setData(data: D | Def): void;
  refresh(): GqlResource<D>;
}

export type GqlHook<D, V extends GqlVars = GqlVars, Def = never> = ((vars?: V) => GqlHookState<D, Def>) & {
  // Methods
  prefetch(vars?: V): GqlResource<D>;
};

// Hook builder
export function $graphql<D, V extends GqlVars>(doc: GqlDoc<V>, options: GqlApiOptionsSuspense<V>): GqlHook<D, V>;
export function $graphql<D, V extends GqlVars>(doc: GqlDoc<V>, options?: GqlApiOptionsEffect<V>): GqlHook<D, V, undefined>;
export function $graphql<D, V extends GqlVars>(doc: GqlDoc<V>, options?: GqlApiOptions<V>): GqlHook<D, V, undefined>;

export function $graphql<D, V extends GqlVars>(doc: GqlDoc<V>, options: GqlApiOptions<V> = {}): GqlHook<D, V, undefined> {
  const request = buildRequest(doc);

  // Options
  const { url = '/graphql' } = options;
  options.key ??= `gql:${url}:${request.operationName}`;

  // Hook
  const useApiData = $api<GqlResponse<D>, GqlRequest<V>>('post', url, options);

  function useGqlData(vars?: V) {
    // Add vars to body
    const _vars = useDeepMemo(vars);
    const body = useMemo(() => ({ ...request, variables: _vars }), [_vars]);

    // "send" request
    const { isLoading, data, setData, refresh } = useApiData(body);

    return {
      isLoading,
      data: data?.data,
      errors: data?.errors || [],
      setData: useCallback((update: D) => setData({ data: update, errors: [] }), [setData]),
      refresh: useCallback(() => refresh().then(({ data }) => data), [refresh]),
    };
  }

  return Object.assign(useGqlData, {
    prefetch(vars?: V) {
      return useApiData.prefetch({ ...request, variables: vars })
        .then(({ data }) => data);
    }
  });
}
