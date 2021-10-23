import { normalizeUpdator, Updator, useSwrCache } from '@jujulego/alma-api';
import { useDeepMemo } from '@jujulego/alma-utils';
import { GraphQLError } from 'graphql';
import { useCallback, useDebugValue, useEffect, useMemo, useState } from 'react';

import { GqlVariables, GqlResponse, GqlDocument, GqlRequest, GqlQueryHook } from '../types';
import { buildRequest } from '../utils';

// Types
export interface GqlAutoLoadConfig {
  /**
   * Load request on mount
   *
   * @default true
   */
  load?: boolean;

  /**
   * Disable use of Swr cache
   *
   * @default false
   */
  disableSwr?: boolean;
}

export interface GqlAutoLoadState<D> {
  /**
   * Indicates if the request is running.
   */
  loading: boolean;

  /**
   * Result of the request
   */
  data?: D;

  /**
   * Errors of the request
   */
  errors?: ReadonlyArray<GraphQLError>;

  /**
   * Forces request reload
   */
  reload: () => void;

  /**
   * Update stored data
   */
  setData: (data?: D | Updator<D | undefined>) => void;
}

// Hook
export function useGqlAutoLoad<D, V extends GqlVariables>(hook: GqlQueryHook<D, V>, url: string, doc: GqlDocument<D, V> | GqlRequest<D, V>, vars: V, config: GqlAutoLoadConfig = {}): GqlAutoLoadState<D> {
  const { load = true, disableSwr = false } = config;

  // State
  const [reload, setReload] = useState(load ? 1 : 0);

  // Build request
  const sdoc = useDeepMemo(doc);
  const req = useMemo(() => buildRequest(sdoc), [sdoc]);

  useEffect(() => {
    if (!req.operationName) console.warn('Graphql request has no operation name, it won\'t be cached');
  }, [req]);

  // Cache
  const { data, setData } = useSwrCache<GqlResponse<D> | undefined>(`gql:${req.operationName}`, undefined, req.operationName ? disableSwr : true);
  useDebugValue(data);

  // Send request
  const { loading, send } = hook(url, req);

  useEffect(() => {
    if (reload === 0) return;

    const prom = send(vars)
      .then((res) => {
        setData(res);
      });

    return () => prom.cancel();
  }, [reload, send, vars, setData]);

  return {
    loading,
    ...data,
    reload: useCallback(() => setReload((old) => old + 1), []),
    setData: useCallback((data) => {
      setData((old) => ({ ...old, data: normalizeUpdator(data)(old?.data) }));
    }, [setData]),
  };
}