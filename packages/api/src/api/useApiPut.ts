import { useDeepMemo } from '@jujulego/alma-utils';
import { useCallback } from 'react';

import { ApiLoadableHookConfig } from './useApiAutoLoad';
import { useApiRequest } from './useApiRequest';
import { ApiPromise } from '../api-promise';
import { ApiHeaders, ApiResponse, ApiResponseType, ApiRTConstraint } from '../types';

// Types
export interface ApiPutRequestState<B, D extends ApiRTConstraint[T], T extends ApiResponseType> {
  /**
   * Indicates if the request is running.
   */
  loading: boolean;

  /**
   * Callback that sends a put request and resolves to the response.
   */
  send: (body: B, url?: string, headers?: ApiHeaders) => ApiPromise<ApiResponse<T, D>>;
}

// Hook
/**
 * Send a put request, returns the current status of the request.
 */
export function useApiPut<B, D extends ApiRTConstraint[T], T extends ApiResponseType = 'json'>(defaultUrl: string, config: ApiLoadableHookConfig<T> = {}): ApiPutRequestState<B, D, T> {
  const { responseType = 'json' as T, headers: defaultHeaders = {} } = config;

  // Stabilise objects
  const sDefaultHeaders = useDeepMemo(defaultHeaders);

  // Api call
  const { loading, send } = useApiRequest<'put', T, B, D>();

  return {
    loading,
    send: useCallback((body, url = defaultUrl, headers= sDefaultHeaders) => {
      return send({ method: 'put', url, headers, body, responseType });
    }, [send, defaultUrl, responseType, sDefaultHeaders])
  };
}
