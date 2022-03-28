import { useDeepMemo } from '@jujulego/alma-utils';
import { useCallback } from 'react';

import { ApiPromise } from '../api-promise';
import { ApiHeaders, ApiResponse } from '../types';
import { useApiRequest } from './useApiRequest';

// Types
export interface ApiGetRequestState<D> {
  /**
   * Indicates if the request is running.
   */
  loading: boolean;

  /**
   * Callback that sends a get request and resolves to the response.
   */
  send: (url?: string, headers?: ApiHeaders) => ApiPromise<ApiResponse<D>>;
}

// Hook
/**
 * Send a get request, returns the current status of the request.
 *
 * @param defaultUrl: Default URL of the request (could be overridden by send call)
 * @param defaultHeaders: Default Headers of the request (could be overridden by send call)
 */
export function useApiGet<D>(defaultUrl: string, defaultHeaders: ApiHeaders = {}): ApiGetRequestState<D> {
  // Stabilise objects
  const sDefaultHeaders = useDeepMemo(defaultHeaders);

  // Api call
  const { loading, send } = useApiRequest<'get', unknown, D>();

  return {
    loading,
    send: useCallback((url = defaultUrl, headers= sDefaultHeaders) => {
      return send({ method: 'get', url: url, headers });
    }, [send, defaultUrl, sDefaultHeaders])
  };
}
