import axios, { CancelTokenSource } from 'axios';
import { useCallback, useDebugValue } from 'react';
import { ApiGetRequestConfig, ApiGetReturn, useGetRequest } from '@jujulego/alma-api';
import { useDeepMemo } from '@jujulego/alma-utils';

export function useGraphql<R, E = unknown>(url: string, query: string, config: ApiGetRequestConfig = {}): ApiGetReturn<R, E> {
  useDebugValue(url);
  const { load, ...rconfig } = config;

  // Callbacks
  const generator = useCallback(
    (source: CancelTokenSource) => axios.post<R>(url, query, { ...rconfig, cancelToken: source.token }),
    [url, useDeepMemo(rconfig)] // eslint-disable-line react-hooks/exhaustive-deps
  );

  return useGetRequest<R, E>(generator, `graphql:${url}`, load);
}