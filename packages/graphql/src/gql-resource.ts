import { ApiGetRequestConfig, Updator, useGetRequest } from '@jujulego/alma-api';
import axios, { CancelTokenSource } from 'axios';
import { useCallback } from 'react';

import { GqlDocument, GqlErrorResponse, GqlResponse, GqlVariables } from './types';
import { buildRequest } from './utils';
import { useDeepMemo } from '../../utils';

// Types
export interface IGqlResourceState<T, E = unknown> {
  loading: boolean;
  data?: T;
  error?: E | GqlErrorResponse;

  reload: () => void;
  update: (data: T | Updator<T>) => void;
}

export type IGqlResourceHook<T, V> = (vars: V, config?: ApiGetRequestConfig) => IGqlResourceState<T>;

// Hook builder
export function gqlResource<T, V extends GqlVariables = GqlVariables, E = unknown>(url: string, doc: GqlDocument): IGqlResourceHook<T, V> {
  // Build request
  const req = buildRequest(doc);

  if (!req.operationName) {
    console.warn('No operation name found in document, result won\'t be cached');
  }

  // Hook
  function useGqlResource(vars: V, config: ApiGetRequestConfig = {}): IGqlResourceState<T> {
    const { load, ...rconfig } = config;

    // Stabilise objects
    const svars = useDeepMemo(vars);
    const sconfig = useDeepMemo(rconfig);

    // Callbacks
    const generator = useCallback(
      (source: CancelTokenSource) => axios.post<GqlResponse<T>>(url, { ...req, variables: svars }, { ...sconfig, cancelToken: source.token }),
      [svars, sconfig]
    );

    // Api call
    const { data, error, update, ...state } = useGetRequest<GqlResponse<T>, E | GqlErrorResponse>(generator, `graphql:${url}:${req.operationName}`, {
      disableSwr: !req.operationName,
      load
    });

    return {
      ...state,
      data: data?.data,
      error: error || (data?.errors?.length ? data as GqlErrorResponse : undefined),
      update: useCallback((data: T | Updator<T>) => {
        const updator: Updator<T> = typeof data === 'function' ? (data as Updator<T>) : () => data;

        update((old) => ({ ...old, data: updator(old?.data) }));
      }, [update])
    };
  }

  return useGqlResource;
}