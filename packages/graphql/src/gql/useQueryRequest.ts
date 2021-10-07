import { ApiGetRequestConfig, Updator, useGetRequest } from '@jujulego/alma-api';
import { useDeepMemo } from '@jujulego/alma-utils';
import axios, { CancelTokenSource } from 'axios';
import { useCallback, useDebugValue, useMemo } from 'react';

import { GqlErrorResponse, GqlQueryReturn, GqlRequest, GqlResponse, GqlVariables } from '../types';

export function useQueryRequest<R, V extends GqlVariables>(url: string, req: GqlRequest, vars: V, config: ApiGetRequestConfig = {}): GqlQueryReturn<R> {
  const { load, ...rconfig } = config;

  // Stabilise objects
  const sconfig = useDeepMemo(rconfig);
  const svars = useDeepMemo(vars);

  // Memos
  const swrId = useMemo(() => ['graphql', url, req.operationName].join(':'), [url, req.operationName]);
  useDebugValue(swrId);

  // Request generator
  const generator = useCallback((source: CancelTokenSource) => axios.post<GqlResponse<R>>(
    url,
    { ...req, variables: svars },
    { ...sconfig, cancelToken: source.token }
  ), [url, req, svars, sconfig]);

  // Api call
  const { data, error, update, ...state } = useGetRequest<GqlResponse<R>, GqlErrorResponse>(generator, swrId, {
    disableSwr: !req.operationName,
    load
  });

  return {
    loading: state.loading,
    data: data?.data,
    error: error || (data?.errors?.length ? data as GqlErrorResponse : undefined),

    update: useCallback((data: R | Updator<R>) => {
      const updator: Updator<R> = typeof data === 'function' ? (data as Updator<R>) : () => data;

      update((old) => ({ ...old, data: updator(old?.data) as R }));
    }, [update]),
    reload: state.reload,
  };
}