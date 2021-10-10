import axios, { AxiosError, AxiosRequestConfig, AxiosResponse, CancelTokenSource } from 'axios';
import { useCallback, useEffect, useState } from 'react';

import { useSwrCache } from '../cache';
import { ApiState, Updator } from '../types';

// Types
export type ApiGetRequestGenerator<R> = (source: CancelTokenSource) => Promise<AxiosResponse<R>>

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
  const { data: cached, setCache } = useSwrCache<R>(swrId);

  // State
  const [reload, setReload] = useState(load ? 1 : 0);
  const [state, setState] = useState<ApiState<R, E>>({
    loading: false,
    cached: !disableSwr && (cached !== undefined),
    data: disableSwr ? undefined : cached
  });

  // Effect
  useEffect(() => {
    if (reload === 0) return;
    setState((old) => ({ ...old, loading: true }));

    // Create cancel token
    const source = axios.CancelToken.source();

    // Make request
    generator(source)
      .then((res) => {
        setState({ loading: false, cached: false, status: res.status, data: res.data });
      })
      .catch((error) => {
        if (axios.isCancel(error)) {
          return;
        }

        if (axios.isAxiosError(error)) {
          const { response } = error as AxiosError<E>;

          if (response) {
            setState({ loading: false, cached: false, status: response.status, error: response.data });

            return;
          }
        }

        setState((old) => ({ ...old, loading: false }));
        throw error;
      });

    // Cancel
    return () => {
      source.cancel();
    };
  }, [generator, reload, setCache]);

  useEffect(() => {
    if (state.data && !state.cached && !disableSwr) {
      setCache(state.data);
    }
  }, [state.data, state.cached, setCache, disableSwr]);

  useEffect(() => {
    if (!disableSwr) {
      setState((old) => ({ ...old, cached: true, data: cached }));
    }
  }, [swrId, cached, setState, disableSwr]);

  return {
    ...state,
    update: useCallback(
      (data: R | Updator<R>) => {
        const updator: Updator<R> = typeof data === 'function' ? (data as Updator<R>) : () => data;

        setState((old) => ({ ...old, data: updator(old.data) }));
      },
      [setState]
    ),
    reload: useCallback(() => setReload((old) => old + 1), [setReload])
  };
}
