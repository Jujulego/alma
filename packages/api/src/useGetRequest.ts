import axios, { AxiosError, AxiosRequestConfig, AxiosResponse, CancelTokenSource } from 'axios';
import { useCallback, useEffect, useState } from 'react';

import { useCache } from './CacheContext';
import { APIState, Updator } from './types';

// Types
export type APIGetRequestGenerator<R> = (source: CancelTokenSource) => Promise<AxiosResponse<R>>

export interface APIGetRequestConfig extends Omit<AxiosRequestConfig, 'cancelToken'> {
  /**
   * Load request on mount
   *
   * @default true
   */
  load?: boolean;
}

export interface APIGetReturn<R, E = unknown> extends APIState<R, E> {
  /**
   * Update cached result
   *
   * @param data: value to store
   */
  update: (data: R | Updator<R>) => void;

  /**
   * Force request reload
   */
  reload: () => void;
}

// Base hooks
export function useGetRequest<R, E = unknown>(generator: APIGetRequestGenerator<R>, cacheId: string, load = true): APIGetReturn<R, E> {
  // Cache
  const { data, setCache } = useCache<R>(cacheId);

  // State
  const [reload, setReload] = useState(load ? 1 : 0);
  const [state, setState] = useState<APIState<R, E>>({ data, loading: false });

  // Effect
  useEffect(() => {
    if (reload === 0) return;
    setState((old) => ({ ...old, loading: true }));

    // Create cancel token
    const source = axios.CancelToken.source();

    // Make request
    generator(source)
      .then((res) => {
        setState({ loading: false, status: res.status, data: res.data });
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
      source.cancel();
    };
  }, [generator, reload, setCache]);

  useEffect(() => {
    if (state.data) setCache(state.data);
  }, [state.data, setCache]);

  useEffect(() => {
    setState((old) => ({ ...old, data }));
  }, [cacheId]); // eslint-disable-line react-hooks/exhaustive-deps

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
