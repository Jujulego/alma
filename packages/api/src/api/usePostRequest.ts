import { AxiosRequestConfig, AxiosResponse } from 'axios';
import { useCallback, useState } from 'react';

import { ApiPromise } from '../api-promise';
import { makeRequestApiPromise } from './request-api-promise';
import { ApiParams, ApiResult, ApiState } from '../types';

// Types
export type ApiPostRequestConfig = Omit<AxiosRequestConfig, 'cancelToken'>
export type ApiPostRequestGenerator<B, P extends ApiParams, R> = (body: B, signal: AbortSignal, params?: P) => Promise<AxiosResponse<R>>;

export interface ApiPostReturn<B, P extends ApiParams, R, E = unknown> extends ApiState {
  /**
   * Send a post/put/patch request
   *
   * @param data: body of the request
   * @param params: custom query parameters
   */
  send: (data: B, params?: P) => ApiPromise<ApiResult<R, E>>;
}

// Base hooks
export function usePostRequest<B, R, P extends ApiParams, E = unknown>(generator: ApiPostRequestGenerator<B, P, R>): ApiPostReturn<B, P, R, E> {
  // State
  const [state, setState] = useState<ApiState>({ loading: false });

  // Callback
  const send = useCallback((body: B, params?: P) => {
    setState({ loading: true });

    // Make request
    const abort = new AbortController();

    return makeRequestApiPromise<R, E>(generator(body, abort.signal, params), abort, setState);
  }, [generator]);

  return {
    ...state,
    send
  };
}
