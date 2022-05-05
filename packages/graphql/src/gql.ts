import { globalApiConfig, RequestOptions } from '@jujulego/alma-api';
import { useResource } from '@jujulego/alma-resources';
import { GraphQLError } from 'graphql';
import { Dispatch, SetStateAction, useCallback, useEffect, useState } from 'react';

import { GqlResource, GqlVars } from './types';
import { buildRequest, GqlDoc } from './utils';
import { useGqlHttp } from './hooks';

// Types
export interface GqlOptions extends RequestOptions<'json'> {
  url?: string;
  suspense?: boolean;
}

export interface GqlOptionsEffect extends GqlOptions {
  suspense: false;
}

export interface GqlOptionsSuspense extends GqlOptions {
  suspense?: true;
}

export interface GqlHookState<D> {
  isLoading: boolean;
  errors: readonly GraphQLError[];
  data: D;
  setData: (data: D) => void;
}

export type GqlHook<D, V extends GqlVars = GqlVars> = (vars: V) => GqlHookState<D>;

// Hook builder
export function $gql<D, V extends GqlVars>(doc: GqlDoc<V>, options: GqlOptionsEffect): GqlHook<D | undefined, V>;
export function $gql<D, V extends GqlVars>(doc: GqlDoc<V>, options?: GqlOptionsSuspense): GqlHook<D, V>;
export function $gql<D, V extends GqlVars>(doc: GqlDoc<V>, options?: GqlOptions): GqlHook<D | undefined, V>;

export function $gql<D, V extends GqlVars>(doc: GqlDoc<V>, options: GqlOptions = {}): GqlHook<D | undefined, V> {
  const request = buildRequest(doc);

  // Options
  const {
    suspense = true,
    url = '/graphql',
    query = {},
    headers = {},
    responseType = 'json'
  } = options;

  const config = { ...globalApiConfig(), ...options.config };

  // Hook
  function useGqlData(vars: V) {
    const { warehouse } = config;

    // Create resource
    const send = useGqlHttp<D, V>(url, request, { query, headers, responseType, config });

    const key = `gql:${url}:${request.operationName}`;
    const res = useResource(key, { warehouse, creator: () => send(vars) });

    // State
    const [data, setData] = useState(suspense ? res.read() : undefined);

    // Effect
    useEffect(() => res?.subscribe((data) => setData(data)), [res]);

    return {
      isLoading: res.status === 'pending',
      data: data?.data,
      errors: data?.errors ?? [],
      setData: useCallback((data: D) => setData({ data, errors: [] }), []),
    };
  }

  return useGqlData;
}
