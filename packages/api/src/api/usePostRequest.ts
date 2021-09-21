import axios, { AxiosRequestConfig, AxiosResponse, CancelTokenSource } from 'axios';
import { useCallback, useState } from 'react';

import { APIParams, APIState } from '../types';
import { ApiPromise, makeRequestApiPromise } from '../api-promise';

// Types
export type APIPostRequestConfig = Omit<AxiosRequestConfig, 'cancelToken'>
export type APIPostRequestGenerator<B, P extends APIParams, R> = (body: B, source: CancelTokenSource, params?: P) => Promise<AxiosResponse<R>>;

export interface APIPostReturn<B, P extends APIParams, R, E = unknown> extends APIState<R, E> {
  /**
   * Send a post/put/patch request
   *
   * @param data: body of the request
   * @param params: custom query parameters
   */
  send: (data: B, params?: P) => ApiPromise<R>;
}

// Base hooks
export function usePostRequest<B, R, P extends APIParams, E = unknown>(generator: APIPostRequestGenerator<B, P, R>): APIPostReturn<B, P, R, E> {
  // State
  const [state, setState] = useState<APIState<R, E>>({ loading: false });

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
