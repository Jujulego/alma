import { AxiosResponse } from 'axios';
import { useCallback, useState } from 'react';

import { ApiPromise} from '../api-promise';
import { ApiParams, ApiState } from '../types';
import { makeRequestApiPromise } from './request-api-promise';

// Types
export type ApiDeleteRequestGenerator<P extends ApiParams, R> = (signal: AbortSignal, params?: P) => Promise<AxiosResponse<R>>;

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

      // Make request
      const abort = new AbortController();

      return makeRequestApiPromise(generator(abort.signal, params), abort, setState);
    },
    [generator]
  );

  return {
    ...state,
    send
  };
}
