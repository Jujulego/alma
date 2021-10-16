import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
import { useCallback, useEffect, useState } from 'react';

import { useSwrCache } from '../cache';
import { ApiResult, ApiState, normalizeUpdator, Updator } from '../types';

// Types
export type ApiGetRequestGenerator<R> = (signal: AbortSignal) => Promise<AxiosResponse<R>>
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

export type ApiGetReturn<R, E = unknown> = ApiState & ApiResult<R, E> & {
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
export function useGetRequest<R, E = unknown>(generator: ApiGetRequestGenerator<R>, swrId: string, config: ApiGetRequestConfig = {}): ApiGetReturn<R, E> {
  const { load = true, disableSwr = false } = config;

  // Cache
  const { data, setData } = useSwrCache<ApiResult<R, E>>(swrId, { status: 0 }, disableSwr);

  // State
  const [reload, setReload] = useState(load ? 1 : 0);
  const [state, setState] = useState<ApiState>({
    loading: false,
  });

  // Effect
  useEffect(() => {
    if (reload === 0) return;
    setState((old) => ({ ...old, loading: true }));

    // Make request
    const abort = new AbortController();

    generator(abort.signal)
      .then((res) => {
        setState({ loading: false });
        setData({ status: res.status, data: res.data });
      })
      .catch((error) => {
        if (axios.isCancel(error)) {
          return;
        }

        setState({ loading: false });

        if (axios.isAxiosError(error)) {
          const { response } = error as AxiosError<E>;

          if (response) {
            setData({ status: response.status, error: response.data });

            return;
          }
        }

        throw error;
      });

    // Cancel
    return () => {
      abort.abort();
    };
  }, [generator, reload, setData, setState]);

  return {
    ...state, ...data,
    update: useCallback((arg?: R | Updator<R | undefined>) => {
      setData((old) => ({ status: old?.status ?? 0, data: normalizeUpdator(arg)(old?.data) }));
    }, [setData]),
    reload: useCallback(() => setReload((old) => old + 1), [setReload])
  };
}
