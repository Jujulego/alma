import { useDeepMemo } from '@jujulego/alma-utils';
import { useCallback } from 'react';

import { ApiPromise } from '../api-promise';
import { ApiHeaders, ApiResponse } from '../types';
import { ApiLoadableHookState } from './useApiAutoLoad';
import { useApiRequest } from './useApiRequest';

// Types
export interface ApiHeadRequestState<D> extends ApiLoadableHookState<D> {
  /**
   * Indicates if the request is running.
   */
  loading: boolean;

  /**
   * Callback that sends a head request and resolves to the response.
   */
  send: (url?: string, headers?: ApiHeaders) => ApiPromise<ApiResponse<D>>;
}

// Hook
/**
 * Send a head request with axios, returns the current status of the request.
 *
 * @param defaultUrl: Default URL of the request (could be overridden by send call)
 * @param defaultHeaders: Default Headers of the request (could be overridden by send call)
 */
export function useApiHead<D>(defaultUrl: string, defaultHeaders: ApiHeaders = {}): ApiHeadRequestState<D> {
  // Stabilise objects
  const sDefaultHeaders = useDeepMemo(defaultHeaders);

  // Api call
  const { loading, send } = useApiRequest<'head', unknown, D>();

  return {
    loading,
    send: useCallback((url = defaultUrl, headers= sDefaultHeaders) => {
      return send({ method: 'head', url: url, headers });
    }, [send, defaultUrl, sDefaultHeaders])
  };
}