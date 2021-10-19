import { ApiPromise, Updator, useSwrCache } from '@jujulego/alma-api';
import { useDeepMemo } from '@jujulego/alma-utils';
import { useCallback, useDebugValue, useEffect, useMemo, useState } from 'react';

import { GqlVariables, GqlResponse, GqlDocument, GqlRequest } from '../types';
import { buildRequest } from '../utils';

// Types
export interface GqlLoadableHookState<D, V extends GqlVariables> {
  loading: boolean;
  send: (vars: V) => ApiPromise<GqlResponse<D>>;
}

export type GqlLoadableHook<D, V extends GqlVariables> = (url: string, req: GqlRequest<D, V>) => GqlLoadableHookState<D, V>;

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
  data?: GqlResponse<D>;

  /**
   * Forces request reload
   */
  reload: () => void;

  /**
   * Update cached data
   */
  update: (data?: GqlResponse<D> | Updator<GqlResponse<D> | undefined>) => void;
}

// Hook
export function useGqlAutoLoad<D, V extends GqlVariables>(hook: GqlLoadableHook<D, V>, url: string, doc: GqlDocument<D, V> | GqlRequest<D, V>, vars: V, config: GqlAutoLoadConfig = {}): GqlAutoLoadState<D> {
  const { load = true, disableSwr = false } = config;

  // State
  const [reload, setReload] = useState(load ? 1 : 0);

  // Build request
  const sdoc = useDeepMemo(doc);
  const req = useMemo(() => buildRequest(sdoc), [sdoc]);

  useEffect(() => {
    if (!req.operationName) console.warn('Gql request has no operation name, so it won\'t be cached');
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
    data,
    reload: useCallback(() => setReload((old) => old + 1), []),
    update: setData
  };
}