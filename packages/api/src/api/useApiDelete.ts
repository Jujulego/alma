import { useDeepMemo } from '@jujulego/alma-utils';
import { useCallback } from 'react';

import { useApiRequest } from './useApiRequest';
import { ApiPromise } from '../api-promise';
import { ApiHeaders, ApiLoadableHookConfig, ApiResponse, ApiResponseType, ApiRTConstraint } from '../types';

// Types
export interface ApiDeleteRequestState<D extends ApiRTConstraint[T], T extends ApiResponseType> {
  /**
   * Indicates if the request is running.
   */
  loading: boolean;

  /**
   * Callback that sends a delete request and resolves to the response.
   */
  send: (url?: string, headers?: ApiHeaders) => ApiPromise<ApiResponse<T, D>>;
}

// Hook
/**
 * Send a delete request, returns the current status of the request.
 */
export function useApiDelete<D extends ApiRTConstraint[T], T extends ApiResponseType = 'json'>(defaultUrl: string, config: ApiLoadableHookConfig<T> = {}): ApiDeleteRequestState<D, T> {
  const { responseType = 'json' as T, headers: defaultHeaders = {} } = config;

  // Stabilise objects
  const sDefaultHeaders = useDeepMemo(defaultHeaders);

  // Api call
  const { loading, send } = useApiRequest<'delete', T, unknown, D>();

  return {
    loading,
    send: useCallback((url = defaultUrl, headers= sDefaultHeaders) => {
      return send({ method: 'delete', url: url, headers, responseType });
    }, [send, defaultUrl, responseType, sDefaultHeaders])
  };
}
