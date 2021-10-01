import { useDeepMemo } from '@jujulego/alma-utils';
import axios, { CancelTokenSource } from 'axios';
import { useCallback, useDebugValue } from 'react';

import { ApiParams } from '../types';
import { ApiGetRequestConfig, ApiGetReturn, useGetRequest } from './useGetRequest';

/**
 * Send a options request with axios, returns the current status of the request.
 * 
 * @param url: URL of the request
 * @param params: query parameters
 * @param config: axios configuration
 */
export function useApiOptions<R, P extends ApiParams = ApiParams, E = unknown>(url: string, params?: P, config: ApiGetRequestConfig = {}): ApiGetReturn<R, E> {
  useDebugValue(url);
  const { noCache, load, ...rconfig } = config;

  // Callbacks
  const generator = useCallback(
    (source: CancelTokenSource) => axios.options<R>(url, { ...rconfig, params, cancelToken: source.token }),
    [url, useDeepMemo(params), useDeepMemo(rconfig)] // eslint-disable-line react-hooks/exhaustive-deps
  );

  return useGetRequest<R, E>(generator, `api-options:${url}`, { noCache, load });
}