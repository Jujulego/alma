import { AxiosRequestConfig, AxiosResponse } from 'axios';
import { useCallback, useEffect, useState } from 'react';

import { useSwrCache } from '../cache';
import { ApiParams, ApiResult, ApiState, normalizeUpdator, Updator } from '../types';
import { makeRequestApiPromise } from './request-api-promise';
import { ApiPromise } from '../api-promise';

// Types
export type ApiGetRequestGenerator<R, P extends ApiParams> = (signal: AbortSignal, params?: P) => Promise<AxiosResponse<R>>
export type ApiGetUpdate<R> = (data?: R | Updator<R | undefined>) => void;

export interface ApiGetRequestConfig extends Omit<AxiosRequestConfig, 'cancelToken'> {
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

export type ApiGetReturn<R, P extends ApiParams, E = unknown> = ApiState & ApiResult<R, E> & {
  /**
   * Send get request
   *
   * @param params: custom query parameters
   */
  send: (params?: P) => ApiPromise<ApiResult<R, E>>;

  /**
   * Update cached result
   *
   * @param data: value to store or updator
   */
  update: ApiGetUpdate<R>;

  /**
   * Force request reload
   */
  reload: () => void;
}

// Base hooks
export function useGetRequest<R, P extends ApiParams = ApiParams, E = unknown>(generator: ApiGetRequestGenerator<R, P>, swrId: string, params?: P, config: ApiGetRequestConfig = {}): ApiGetReturn<R, P, E> {
  const { load = true, disableSwr = false } = config;

  // Cache
  const { data, setData } = useSwrCache<ApiResult<R, E>>(swrId, { status: 0 }, disableSwr);

  // State
  const [reload, setReload] = useState(load ? 1 : 0);
  const [state, setState] = useState<ApiState>({
    loading: false,
  });

  // Callback
  const send = useCallback((params?: P) => {
    setState({ loading: true });

    // Make request
    const abort = new AbortController();
    return makeRequestApiPromise<R, E>(generator(abort.signal, params), abort, setState);
  }, [generator]);

  // Effect
  useEffect(() => {
    if (reload === 0) return;

    const prom = send(params)
      .then((res) => {
        setData(res);
      });

    // Cancel
    return () => prom.cancel();
  }, [send, reload, params, setData]);

  return {
    ...state, ...data, send,
    update: useCallback((arg?: R | Updator<R | undefined>) => {
      setData((old) => ({ status: old.status ?? 0, data: normalizeUpdator(arg)(old.data) }));
    }, [setData]),
    reload: useCallback(() => setReload((old) => old + 1), [])
  };
}
