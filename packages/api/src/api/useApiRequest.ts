import axios from 'axios';
import { useCallback, useState } from 'react';

import { ApiPromise, makeApiPromise } from '../api-promise';
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
  // State
  const [loading, setLoading] = useState(false);

  // Callback
  const send = useCallback((req: ApiRequest<M, B>) => {
    setLoading(true);

    // Make request
    const abort = new AbortController();
    return makeApiPromise(axios.request<D>({
      method: req.method,
      url: req.url,
      headers: req.headers,
      data: req.body,
      signal: abort.signal
    })
      .then((res) => {
        setLoading(false);
        return res;
      })
      .catch((error) => {
        setLoading(false);
        throw error;
      }), () => abort.abort());
  }, []);

  return { loading, send };
}