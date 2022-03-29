import { useDeepMemo } from '@jujulego/alma-utils';
import { useCallback } from 'react';

import { ApiLoadableHookConfig } from './useApiAutoLoad';
import { useApiRequest } from './useApiRequest';
import { ApiPromise } from '../api-promise';
import { ApiHeaders, ApiResponse, ApiResponseType, ApiRTConstraint } from '../types';

// Types
export interface ApiHeadRequestState<D extends ApiRTConstraint[T], T extends ApiResponseType> {
  /**
   * Indicates if the request is running.
   */
  loading: boolean;

  /**
   * Callback that sends a head request and resolves to the response.
   */
  send: (url?: string, headers?: ApiHeaders) => ApiPromise<ApiResponse<T, D>>;
}

// Hook
/**
 * Send a head request, returns the current status of the request.
 */
export function useApiHead<D extends ApiRTConstraint[T], T extends ApiResponseType = 'json'>(defaultUrl: string, config: ApiLoadableHookConfig<T> = {}): ApiHeadRequestState<D, T> {
  const { responseType = 'json' as T, headers: defaultHeaders = {} } = config;

  // Stabilise objects
  const sDefaultHeaders = useDeepMemo(defaultHeaders);

  // Api call
  const { loading, send } = useApiRequest<'head', T, unknown, D>();

  return {
    loading,
    send: useCallback((url = defaultUrl, headers= sDefaultHeaders) => {
      return send({ method: 'head', url, headers, responseType });
    }, [send, defaultUrl, responseType, sDefaultHeaders])
  };
}
