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
 * Send a get request with axios, returns the current status of the request.
 *
 * @param url: Default URL of the request (could be overridden by send call)
 * @param headers: Default Headers of the request (could be overridden by send call)
 */
export function useApiGet<D>(url: string, headers: ApiHeaders = {}): ApiGetRequestState<D> {
  // Stabilise objects
  const sUrl = url;
  const sHeaders = useDeepMemo(headers);

  // Api call
  const { loading, send } = useApiRequest<'get', unknown, D>();

  return {
    loading,
    send: useCallback((url = sUrl, headers= sHeaders) => {
      return send({ method: 'get', url: url, headers });
    }, [send, sUrl, sHeaders])
  };
}