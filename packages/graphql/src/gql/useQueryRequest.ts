import { ApiGetRequestConfig, Updator, useGetRequest } from '@jujulego/alma-api';
import { useDeepMemo } from '@jujulego/alma-utils';
import axios, { CancelTokenSource } from 'axios';
import { useCallback, useDebugValue } from 'react';

import { GqlErrorResponse, GqlQueryReturn, GqlRequest, GqlResponse, GqlVariables } from '../types';

export function useQueryRequest<R, V extends GqlVariables, E = unknown>(url: string, req: GqlRequest, vars: V, config: ApiGetRequestConfig = {}): GqlQueryReturn<R, E> {
  useDebugValue(`${req.operationName} => ${url}`);
  const { load, ...rconfig } = config;

  // Stabilise objects
  const sconfig = useDeepMemo(rconfig);
  const svars = useDeepMemo(vars);

  // Request generator
  const generator = useCallback((source: CancelTokenSource) => axios.post<GqlResponse<R>>(
    url,
    { ...req, variables: svars },
    { ...sconfig, cancelToken: source.token }
  ), [url, req, svars, sconfig]);

  // Api call
  const { data, error, update, ...state } = useGetRequest<GqlResponse<R>, E | GqlErrorResponse>(generator, `graphql:${url}:${req.operationName}`, {
    disableSwr: !req.operationName,
    load
  });

  return {
    ...state,
    data: data?.data,
    error: error || (data?.errors?.length ? data as GqlErrorResponse : undefined),
    update: useCallback((data: R | Updator<R>) => {
      const updator: Updator<R> = typeof data === 'function' ? (data as Updator<R>) : () => data;

      update((old) => ({ ...old, data: updator(old?.data) }));
    }, [update]),
  };
}