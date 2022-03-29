import { useCallback, useDebugValue, useEffect, useState } from 'react';

import { useSwrCache } from '../cache';
import { ApiHeaders, ApiResponse, ApiResponseType, ApiRTConstraint } from '../types';
import { Updator } from '../utils';
import { ApiPromise } from '../api-promise';

// Types
export interface ApiLoadableHookConfig<T extends ApiResponseType> {
  /**
   * Default Headers of the request (could be overridden by send call)
   */
  headers?: ApiHeaders;

  /**
   * Response type
   * @default 'json'
   */
  responseType?: T;
}

export interface ApiLoadableHookState<D extends ApiRTConstraint[T], T extends ApiResponseType> {
  /**
   * Indicates if the request is running.
   */
  loading: boolean;

  /**
   * Callback that sends a get request and resolves to the response.
   */
  send: () => ApiPromise<ApiResponse<T, D>>;
}

export type ApiLoadableHook<D extends ApiRTConstraint[T], T extends ApiResponseType> = (url: string, config?: ApiLoadableHookConfig<T>) => ApiLoadableHookState<D, T>;

export interface ApiAutoLoadConfig<T extends ApiResponseType> {
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

  /**
   * Response type
   */
  responseType?: T;
}

export interface ApiAutoLoadState<D extends ApiRTConstraint[T], T extends ApiResponseType> {
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
export function useApiAutoLoad<D extends ApiRTConstraint[T], T extends ApiResponseType = 'json'>(hook: ApiLoadableHook<D, T>, url: string, config: ApiAutoLoadConfig<T> = {}): ApiAutoLoadState<D, T> {
  const { load = true, disableSwr = false, headers, responseType = 'json' as T } = config;

  // Cache
  const { data, setData } = useSwrCache<D | undefined>(`api:${url}`, undefined, disableSwr);
  useDebugValue(data);

  // State
  const [reload, setReload] = useState(load ? 1 : 0);
  const [error, setError] = useState<unknown>();

  // Api call
  const { loading, send } = hook(url, { headers, responseType });

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
