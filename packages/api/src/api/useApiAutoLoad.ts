import { useCallback, useDebugValue, useEffect, useState } from 'react';

import { useSwrCache } from '../cache';
import { ApiHeaders, ApiResponse } from '../types';
import { Updator } from '../utils';
import { ApiPromise } from '../api-promise';

// Types
export interface ApiLoadableHookState<D> {
  loading: boolean;
  send: () => ApiPromise<ApiResponse<D>>;
}

export type ApiLoadableHook<D> = (url: string, headers?: ApiHeaders) => ApiLoadableHookState<D>;

export interface ApiAutoLoadConfig {
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

  /**
   * Request headers
   */
  headers?: ApiHeaders;
}

export interface ApiAutoLoadState<D> {
  /**
   * Indicates if the request is running.
   */
  loading: boolean;

  /**
   * Result of the request
   */
  data?: D;

  /**
   * Error
   */
  error?: unknown;

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
export function useApiAutoLoad<D>(hook: ApiLoadableHook<D>, url: string, config: ApiAutoLoadConfig = {}): ApiAutoLoadState<D> {
  const { load = true, disableSwr = false, headers } = config;

  // Cache
  const { data, setData } = useSwrCache<D | undefined>(`api:${url}`, undefined, disableSwr);
  useDebugValue(data);

  // State
  const [reload, setReload] = useState(load ? 1 : 0);
  const [error, setError] = useState<unknown>();

  // Api call
  const { loading, send } = hook(url, headers);

  // Effects
  useEffect(() => {
    if (reload === 0) return;

    const prom = send()
      .then((res) => {
        setData(res.data);
      })
      .catch((err) => {
        setError(err);
      });

    return () => prom.cancel();
  }, [reload, send, setData]);

  return {
    loading,
    data, error,
    reload: useCallback(() => setReload((old) => old + 1), []),
    setData
  };
}
