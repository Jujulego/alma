import { useDeepMemo } from '@jujulego/alma-utils';
import { useCallback } from 'react';

import { useApiRequest } from './useApiRequest';
import { ApiPromise } from '../api-promise';
import { ApiHeaders, ApiResponse } from '../types';

// Types
export interface ApiPutRequestState<B, D> {
  /**
   * Indicates if the request is running.
   */
  loading: boolean;

  /**
   * Callback that sends a get request and resolves to the response.
   */
  send: (body: B, url?: string, headers?: ApiHeaders) => ApiPromise<ApiResponse<D>>;
}

// Hook
/**
 * Send a put request with axios, returns the current status of the request.
 *
 * @param defaultUrl: Default URL of the request (could be overridden by send call)
 * @param defaultHeaders: Default Headers of the request (could be overridden by send call)
 */
export function useApiPut<B, D>(defaultUrl: string, defaultHeaders: ApiHeaders = {}): ApiPutRequestState<B, D> {
  // Stabilise objects
  const sDefaultHeaders = useDeepMemo(defaultHeaders);

  // Api call
  const { loading, send } = useApiRequest<'put', B, D>();

  return {
    loading,
    send: useCallback((body, url = defaultUrl, headers= sDefaultHeaders) => {
      return send({ method: 'put', url: url, headers, body });
    }, [send, defaultUrl, sDefaultHeaders])
  };
}