import { useDeepMemo } from '@jujulego/alma-utils';
import { useCallback } from 'react';

import { ApiLoadableHookConfig } from './useApiAutoLoad';
import { useApiRequest } from './useApiRequest';
import { ApiPromise } from '../api-promise';
import { ApiHeaders, ApiResponse, ApiResponseType, ApiRTConstraint } from '../types';

// Types
export interface ApiGetRequestState<D extends ApiRTConstraint[T], T extends ApiResponseType> {
  /**
   * Indicates if the request is running.
   */
  loading: boolean;

  /**
   * Callback that sends a get request and resolves to the response.
   */
  send: (url?: string, headers?: ApiHeaders) => ApiPromise<ApiResponse<T, D>>;
}

// Hook
/**
 * Send a get request, returns the current status of the request.
 */
export function useApiGet<D extends ApiRTConstraint[T], T extends ApiResponseType = 'json'>(defaultUrl: string, config: ApiLoadableHookConfig<T> = {}): ApiGetRequestState<D, T> {
  const { responseType = 'json' as T, headers: defaultHeaders = {} } = config;

  // Stabilise objects
  const sDefaultHeaders = useDeepMemo(defaultHeaders);

  // Api call
  const { loading, send } = useApiRequest<'get', T, unknown, D>();

  return {
    loading,
    send: useCallback((url = defaultUrl, headers= sDefaultHeaders) => {
      return send({ method: 'get', url, headers, responseType });
    }, [send, defaultUrl, responseType, sDefaultHeaders])
  };
}
