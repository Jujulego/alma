import axios, { AxiosRequestConfig, AxiosResponse, CancelTokenSource } from 'axios';
import { useCallback, useState } from 'react';

import { ApiParams, ApiState } from '../types';
import { ApiPromise, makeRequestApiPromise } from '../api-promise';

// Types
export type ApiPostRequestConfig = Omit<AxiosRequestConfig, 'cancelToken'>
export type ApiPostRequestGenerator<B, P extends ApiParams, R> = (body: B, source: CancelTokenSource, params?: P) => Promise<AxiosResponse<R>>;

export interface ApiPostReturn<B, P extends ApiParams, R, E = unknown> extends ApiState<R, E> {
  /**
   * Send a post/put/patch request
   *
   * @param data: body of the request
   * @param params: custom query parameters
   */
  send: (data: B, params?: P) => ApiPromise<R>;
}

// Base hooks
export function usePostRequest<B, R, P extends ApiParams, E = unknown>(generator: ApiPostRequestGenerator<B, P, R>): ApiPostReturn<B, P, R, E> {
  // State
  const [state, setState] = useState<ApiState<R, E>>({ loading: false });

  // Callback
  const send = useCallback(
    (body: B, params?: P) => {
      setState((old) => ({ ...old, loading: true }));

      // Create cancel token
      const source = axios.CancelToken.source();

      // Make request
      return makeRequestApiPromise(generator(body, source, params), source, setState);
    },
    [generator]
  );

  return {
    ...state,
    send
  };
}
