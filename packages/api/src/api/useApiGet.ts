import { useDeepMemo } from '@jujulego/alma-utils';
import axios from 'axios';
import { useCallback, useDebugValue } from 'react';

import { ApiParams } from '../types';
import { ApiGetRequestConfig, ApiGetState, useGetRequest } from './useGetRequest';

/**
 * Send a get request with axios, returns the current status of the request.
 *
 * @param url: URL of the request
 * @param params: query parameters
 * @param config: axios configuration
 */
export function useApiGet<R, P extends ApiParams = ApiParams, E = unknown>(url: string, params?: P, config: ApiGetRequestConfig = {}): ApiGetState<R, P, E> {
  useDebugValue(url);
  const { load, disableSwr, ...rconfig } = config;

  // Stabilise objects
  const sconfig = useDeepMemo(rconfig);
  const sparams = useDeepMemo(params);

  // Callbacks
  const generator = useCallback(
    (signal: AbortSignal, params?: P) => axios.get<R>(url, { ...sconfig, params, signal }),
    [url, sconfig]
  );

  return useGetRequest<R, P, E>(generator, `api-get:${url}`, sparams, { load, disableSwr });
}