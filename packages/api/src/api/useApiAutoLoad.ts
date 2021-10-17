import type {
  ApiGetRequestState,
  ApiHeadRequestState,
  ApiOptionsRequestState,
} from './index';
import { useSwrCache } from '../cache';
import { ApiHeaders } from '../types';
import { Updator } from '../utils';
import { useCallback, useDebugValue, useEffect, useState } from 'react';

// Types
interface ApiMethodHookMap<D> {
  get: (url: string, headers?: ApiHeaders) => ApiGetRequestState<D>,
  head: (url: string, headers?: ApiHeaders) => ApiHeadRequestState<D>,
  options: (url: string, headers?: ApiHeaders) => ApiOptionsRequestState<D>,
}

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

  headers?: ApiHeaders;
}

export type ApiAutoLoadUpdate<D> = (data?: D | Updator<D | undefined>) => void;

export interface ApiAutoLoadState<D> {
  /**
   * Indicates if the request is running.
   */
  loading: boolean;

  data?: D;

  reload: () => void;

  update: ApiAutoLoadUpdate<D>;
}

// Hook
export function useApiAutoLoad<M extends keyof ApiMethodHookMap<D>, D>(hook: ApiMethodHookMap<D>[M], url: string, config: ApiAutoLoadConfig = {}): ApiAutoLoadState<D> {
  const { load = true, disableSwr = false, headers } = config;

  // Cache
  const { data, setData } = useSwrCache<D | undefined>(`api:${url}`, undefined, disableSwr);
  useDebugValue(data);

  // State
  const [reload, setReload] = useState(load ? 1 : 0);

  // Api call
  const { loading, send } = hook(url, headers);

  // Effects
  useEffect(() => {
    if (reload === 0) return;

    const prom = send()
      .then((res) => {
        setData(res.data);
      });

    return () => prom.cancel();
  }, [reload, send, setData]);

  return {
    loading,
    data,
    reload: useCallback(() => setReload((old) => old + 1), []),
    update: setData
  };
}