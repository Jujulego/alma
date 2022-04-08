import { useCallback, useContext, useState } from 'react';

import { ApiPromise, makeApiPromise } from '../api-promise';
import { ApiConfigContext } from '../config';
import { ApiMethod, ApiRequest, ApiResponse, ApiResponseType, ApiRTConstraint } from '../types';

// Types
export interface ApiRequestState<M extends ApiMethod, T extends ApiResponseType, B, D extends ApiRTConstraint[T]> {
  /**
   * Indicates if the request is running.
   */
  loading: boolean;

  /**
   * Callback that sends the given request and resolves to the response.
   */
  send: (req: ApiRequest<M, T, B>) => ApiPromise<ApiResponse<T, D>>;
}

// Hook
/**
 * Send http request. Handle loading state and request cancellation.
 */
export function useApiRequest<M extends ApiMethod, T extends ApiResponseType, B, D extends ApiRTConstraint[T]>(): ApiRequestState<M, T, B, D> {
  // Context
  const { fetcher } = useContext(ApiConfigContext);

  // State
  const [loading, setLoading] = useState(false);

  // Callback
  const send = useCallback((req: ApiRequest<M, T, B>) => {
    setLoading(true);

    // Make request
    const abort = new AbortController();
    return makeApiPromise(fetcher<M, T, B, D>(req, abort.signal)
      .then((res) => {
        setLoading(false);
        return res;
      })
      .catch((error) => {
        setLoading(false);
        throw error;
      }), () => abort.abort());
  }, [fetcher]);

  return { loading, send };
}
