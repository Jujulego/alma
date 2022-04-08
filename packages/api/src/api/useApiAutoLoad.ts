import { useDeepMemo } from '@jujulego/alma-utils';
import { useCallback, useDebugValue, useEffect, useState } from 'react';

import { useSwrCache } from '../cache';
import { ApiHeaders, ApiMethod, ApiResponseType, ApiRTConstraint } from '../types';
import { Updator } from '../utils';
import { useApiRequest } from './useApiRequest';

// Types
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
export function useApiAutoLoad<D extends ApiRTConstraint[T], T extends ApiResponseType = 'json'>(method: ApiMethod, url: string, config: ApiAutoLoadConfig<T> = {}): ApiAutoLoadState<D, T> {
  const { load = true, disableSwr = false, headers = {}, responseType = 'json' as T } = config;

  // Stabilise objects
  const sHeaders = useDeepMemo(headers);

  // Cache
  const { data, setData } = useSwrCache<D | undefined>(`api:${url}`, undefined, disableSwr);
  useDebugValue(data);

  // State
  const [reload, setReload] = useState(load ? 1 : 0);
  const [error, setError] = useState<unknown>();

  // Api call
  const { loading, send } = useApiRequest<ApiMethod, T, unknown, D>();

  // Effects
  useEffect(() => {
    if (reload === 0) return;

    const prom = send({ method, url, headers: sHeaders, responseType })
      .then((res) => {
        setData(res.data);
      })
      .catch((err) => {
        setError(err);
      });

    return () => prom.cancel();
  }, [method, url, sHeaders, responseType, reload, send, setData]);

  return {
    loading,
    data, error,
    reload: useCallback(() => setReload((old) => old + 1), []),
    setData
  };
}
