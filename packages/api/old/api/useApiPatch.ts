import { useDeepMemo } from '@jujulego/alma-utils';
import { useCallback } from 'react';

import { useApiRequest } from './useApiRequest';
import { ApiPromise } from '../api-promise';
import { ApiHeaders, ApiLoadableHookConfig, ApiResponse, ApiResponseType, ApiRTConstraint } from '../types';

// Types
export interface ApiPatchRequestState<B, D extends ApiRTConstraint[T], T extends ApiResponseType> {
  /**
   * Indicates if the request is running.
   */
  loading: boolean;

  /**
   * Callback that sends a get request and resolves to the response.
   */
  send: (body: B, url?: string, headers?: ApiHeaders) => ApiPromise<ApiResponse<T, D>>;
}

// Hook
/**
 * Send a patch request, returns the current status of the request.
 */
export function useApiPatch<B, D extends ApiRTConstraint[T], T extends ApiResponseType = 'json'>(defaultUrl: string, config: ApiLoadableHookConfig<T> = {}): ApiPatchRequestState<B, D, T> {
  const { responseType = 'json' as T, headers: defaultHeaders = {} } = config;

  // Stabilise objects
  const sDefaultHeaders = useDeepMemo(defaultHeaders);

  // Api call
  const { loading, send } = useApiRequest<'patch', T, B, D>();

  return {
    loading,
    send: useCallback((body, url = defaultUrl, headers= sDefaultHeaders) => {
      return send({ method: 'patch', url: url, headers, body, responseType });
    }, [send, defaultUrl, responseType, sDefaultHeaders])
  };
}
