import { useDeepMemo } from '@jujulego/alma-utils';
import axios, { CancelTokenSource } from 'axios';
import { useCallback, useDebugValue } from 'react';

import { APIParams } from './types';
import { APIPostRequestConfig, APIPostReturn, usePostRequest } from './usePostRequest';

/**
 * Send a post request with axios, returns the current status of the request.
 *
 * @param url: URL of the request
 * @param params: query parameters
 * @param config: axios configuration
 */
export function useApiPost<B, R = unknown, P extends APIParams = APIParams, E = unknown>(url: string, params?: P, config?: APIPostRequestConfig): APIPostReturn<B, P, R, E> {
  useDebugValue(url);

  // Callbacks
  const generator = useCallback(
    (body: B, source: CancelTokenSource, _params?: P) =>
      axios.post<R>(url, body, { ...config, params: { ...params, ..._params }, cancelToken: source.token }),
    [url, useDeepMemo(params), useDeepMemo(config)] // eslint-disable-line react-hooks/exhaustive-deps
  );

  return usePostRequest<B, R, P, E>(generator);
}