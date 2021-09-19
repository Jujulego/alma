import axios, { AxiosError, AxiosRequestConfig, AxiosResponse, CancelTokenSource } from 'axios';
import { useCallback, useState } from 'react';

import { APIParams, APIPromise, APIState } from './types';

// Types
export type APIPostRequestConfig = Omit<AxiosRequestConfig, 'cancelToken'>
export type APIPostRequestGenerator<B, P extends APIParams, R> = (
  body: B,
  source: CancelTokenSource,
  params?: P
) => Promise<AxiosResponse<R>>;

export interface APIPostReturn<B, P extends APIParams, R, E = unknown> extends APIState<R, E> {
  send: (data: B, params?: P) => APIPromise<R>;
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
      const promise = generator(body, source, params)
        .then((res): R => {
          setState({ loading: false, status: res.status, data: res.data });

          return res.data;
        })
        .catch((error) => {
          if (axios.isAxiosError(error)) {
            const { response } = error as AxiosError<E>;

            if (response) {
              setState({ loading: false, status: response.status, error: response.data });
              throw error;
            }
          }

          setState((old) => ({ ...old, loading: false }));
          throw error;
        }) as APIPromise<R>;

      promise.cancel = () => source.cancel();
      return promise;
    },
    [generator]
  );

  return {
    ...state,
    send
  };
}
