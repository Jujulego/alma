import { ApiGetRequestConfig, Updator, useGetRequest } from '@jujulego/alma-api';
import { useDeepMemo } from '@jujulego/alma-utils';
import axios, { CancelTokenSource } from 'axios';
import { useCallback, useDebugValue, useMemo } from 'react';

import { GqlErrorResponse, GqlRequest, GqlResponse, GqlState, GqlVariables } from '../types';

// Types
export interface GqlQueryState<D> extends GqlState<D> {
  /**
   * Update cached result
   *
   * @param data: value to store or updator
   */
  update: (data: D | Updator<D>) => void;

  /**
   * Force request reload
   */
  reload: () => void;
}

// Hook
export function useQueryRequest<D, V extends GqlVariables>(url: string, req: GqlRequest<D, V>, vars: V, config: ApiGetRequestConfig = {}): GqlQueryState<D> {
  const { load, ...rconfig } = config;

  // Stabilise objects
  const sconfig = useDeepMemo(rconfig);
  const svars = useDeepMemo(vars);

  // Memos
  const swrId = useMemo(() => ['graphql', url, req.operationName].join(':'), [url, req.operationName]);
  useDebugValue(swrId);

  // Request generator
  const generator = useCallback((source: CancelTokenSource) => axios.post<GqlResponse<D>>(
    url,
    { ...req, variables: svars },
    { ...sconfig, cancelToken: source.token }
  ), [url, req, svars, sconfig]);

  // Api call
  const { loading, cached, data, error, update, reload } = useGetRequest<GqlResponse<D>, GqlErrorResponse>(generator, swrId, {
    disableSwr: !req.operationName,
    load
  });

  return {
    loading, cached,
    data: data?.data,
    error: error || (data?.errors?.length ? data as GqlErrorResponse : undefined),

    update: useCallback((data: D | Updator<D>) => {
      const updator: Updator<D> = typeof data === 'function' ? (data as Updator<D>) : () => data;

      update((old) => ({ ...old, data: updator(old?.data) as D }));
    }, [update]),
    reload,
  };
}