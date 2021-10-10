import axios, { AxiosResponse, CancelTokenSource } from 'axios';
import { useCallback, useState } from 'react';

import { ApiPromise, makeRequestApiPromise } from '../api-promise';
import { ApiParams, ApiState } from '../types';

// Types
export type ApiDeleteRequestGenerator<P extends ApiParams, R> = (source: CancelTokenSource, params?: P) => Promise<AxiosResponse<R>>;

export interface ApiDeleteReturn<P extends ApiParams, R, E = unknown> extends ApiState<R, E> {
  /**
   * Send delete request
   *
   * @param params: custom query parameters
   */
  send: (params?: P) => ApiPromise<R>;
}

// Base hooks
export function useDeleteRequest<R, P extends ApiParams, E = unknown>(generator: ApiDeleteRequestGenerator<P, R>): ApiDeleteReturn<P, R, E> {
  // State
  const [state, setState] = useState<ApiState<R, E>>({ loading: false });

  // Callback
  const send = useCallback(
    (params?: P) => {
      setState((old) => ({ ...old, loading: true }));

      // Create cancel token
      const source = axios.CancelToken.source();

      // Make request
      return makeRequestApiPromise(generator(source, params), source, setState);
    },
    [generator]
  );

  return {
    ...state,
    send
  };
}
