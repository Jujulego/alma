import { useDeepMemo } from '@jujulego/alma-utils';
import { useCallback } from 'react';

import { useApiRequest } from './useApiRequest';
import { ApiPromise } from '../api-promise';
import { ApiHeaders, ApiResponse } from '../types';

// Types
export interface ApiDeleteRequestState<D> {
  /**
   * Indicates if the request is running.
   */
  loading: boolean;

  /**
   * Callback that sends a delete request and resolves to the response.
   */
  send: (url?: string, headers?: ApiHeaders) => ApiPromise<ApiResponse<D>>;
}

// Hook
/**
 * Send a delete request, returns the current status of the request.
 *
 * @param defaultUrl: Default URL of the request (could be overridden by send call)
 * @param defaultHeaders: Default Headers of the request (could be overridden by send call)
 */
export function useApiDelete<D>(defaultUrl: string, defaultHeaders: ApiHeaders = {}): ApiDeleteRequestState<D> {
  // Stabilise objects
  const sDefaultHeaders = useDeepMemo(defaultHeaders);

  // Api call
  const { loading, send } = useApiRequest<'delete', unknown, D>();

  return {
    loading,
    send: useCallback((url = defaultUrl, headers= sDefaultHeaders) => {
      return send({ method: 'delete', url: url, headers });
    }, [send, defaultUrl, sDefaultHeaders])
  };
}
