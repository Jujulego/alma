import { useCallback, useContext, useState } from 'react';

import { ApiPromise, makeApiPromise } from '../api-promise';
import { ApiConfigContext } from '../config/ApiConfigContext';
import { ApiMethod, ApiRequest, ApiResponse } from '../types';

// Types
export interface ApiRequestState<M extends ApiMethod, B, D> {
  /**
   * Indicates if the request is running.
   */
  loading: boolean;

  /**
   * Callback that sends the given request and resolves to the response.
   */
  send: (req: ApiRequest<M, B>) => ApiPromise<ApiResponse<D>>;
}

// Hook
/**
 * Send http request with axios. Handle loading state and request cancellation.
 */
export function useApiRequest<M extends ApiMethod, B, D>(): ApiRequestState<M, B, D> {
  // Context
  const { fetcher } = useContext(ApiConfigContext);

  // State
  const [loading, setLoading] = useState(false);

  // Callback
  const send = useCallback((req: ApiRequest<M, B>) => {
    setLoading(true);

    // Make request
    const abort = new AbortController();
    return makeApiPromise(fetcher<M, B, D>(req, abort.signal)
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
