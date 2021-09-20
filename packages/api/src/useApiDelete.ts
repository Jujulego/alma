import { useDeepMemo } from '@jujulego/alma-utils';
import axios, { CancelTokenSource } from 'axios';
import { useCallback, useDebugValue } from 'react';

import { APIParams } from './types';
import { APIDeleteReturn, useDeleteRequest } from './useDeleteRequest';
import { APIPostRequestConfig } from './usePostRequest';

/**
 * Send a delete request with axios, returns the current status of the request.
 *
 * @param url: URL of the request
 * @param params: query parameters
 * @param config: axios configuration
 */
export function useApiDelete<R = unknown, P extends APIParams = APIParams, E = unknown>(url: string, params?: P, config?: APIPostRequestConfig): APIDeleteReturn<P, R, E> {
  useDebugValue(url);

  // Callbacks
  const generator = useCallback(
    (source: CancelTokenSource, _params?: P) =>
      axios.delete<R>(url, { ...config, params: { ...params, ..._params }, cancelToken: source.token }),
    [url, useDeepMemo(params), useDeepMemo(config)] // eslint-disable-line react-hooks/exhaustive-deps
  );

  return useDeleteRequest<R, P, E>(generator);
}