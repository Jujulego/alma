import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
import { useCallback, useEffect, useState } from 'react';

import { useSwrCache } from '../cache';
import { ApiState, Updator } from '../types';

// Types
export type ApiGetRequestGenerator<R> = (signal: AbortSignal) => Promise<AxiosResponse<R>>

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

export interface ApiGetReturn<R, E = unknown> extends ApiState<R, E> {
  /**
   * Update cached result
   *
   * @param data: value to store or updator
   */
  update: (data: R | Updator<R>) => void;

  /**
   * Force request reload
   */
  reload: () => void;
}

// Base hooks
export function useGetRequest<R, E = unknown>(generator: ApiGetRequestGenerator<R>, swrId: string, config: ApiGetRequestConfig = {}): ApiGetReturn<R, E> {
  const { load = true, disableSwr = false } = config;

  // Cache
  const { data, setData } = useSwrCache<R>(swrId, disableSwr);

  // State
  const [reload, setReload] = useState(load ? 1 : 0);
  const [state, setState] = useState<Omit<ApiState<R, E>, 'data'>>({
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
        setState({ loading: false, status: res.status });
        setData(res.data);
      })
      .catch((error) => {
        if (axios.isCancel(error)) {
          return;
        }

        if (axios.isAxiosError(error)) {
          const { response } = error as AxiosError<E>;

          if (response) {
            setState({ loading: false, status: response.status, error: response.data });

            return;
          }
        }

        setState((old) => ({ ...old, loading: false }));
        throw error;
      });

    // Cancel
    return () => {
      abort.abort();
    };
  }, [generator, reload, setData, setState]);

  return {
    ...state, data,
    update: setData,
    reload: useCallback(() => setReload((old) => old + 1), [setReload])
  };
}
