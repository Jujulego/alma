import axios, { AxiosResponse, CancelTokenSource } from 'axios';
import { useCallback, useState } from 'react';

import { APIPromise, makeAPIPromise } from './api-promise';
import { APIParams, APIState } from './types';

// Types
export type APIDeleteRequestGenerator<P extends APIParams, R> = (source: CancelTokenSource, params?: P) => Promise<AxiosResponse<R>>;

export interface APIDeleteReturn<P extends APIParams, R, E = unknown> extends APIState<R, E> {
  /**
   * Send delete request
   *
   * @param params: custom query parameters
   */
  send: (params?: P) => APIPromise<R>;
}

// Base hooks
export function useDeleteRequest<R, P extends APIParams, E = unknown>(generator: APIDeleteRequestGenerator<P, R>): APIDeleteReturn<P, R, E> {
  // State
  const [state, setState] = useState<APIState<R, E>>({ loading: false });

  // Callback
  const send = useCallback(
    (params?: P) => {
      setState((old) => ({ ...old, loading: true }));

      // Create cancel token
      const source = axios.CancelToken.source();

      // Make request
      return makeAPIPromise(generator(source, params), source, setState);
    },
    [generator]
  );

  return {
    ...state,
    send
  };
}
