import { ApiGetRequestConfig, normalizeUpdator, Updator, useGetRequest } from '@jujulego/alma-api';
import { useDeepMemo } from '@jujulego/alma-utils';
import axios from 'axios';
import { useCallback, useDebugValue, useMemo } from 'react';

import { GqlErrorResponse, GqlRequest, GqlResponse, GqlState, GqlVariables } from '../types';

// Types
export type GqlQueryUpdate<D> = (data: D | Updator<D>) => void;

export interface GqlQueryState<D> extends GqlState<D> {
  /**
   * Update cached result
   *
   * @param data: value to store or updator
   */
  update: GqlQueryUpdate<D>;

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
  const generator = useCallback((signal: AbortSignal) => axios.post<GqlResponse<D>>(
    url,
    { ...req, variables: svars },
    { ...sconfig, signal }
  ), [url, req, svars, sconfig]);

  // Api call
  const { loading, data, error, update, reload } = useGetRequest<GqlResponse<D>, GqlErrorResponse>(generator, swrId, {
    disableSwr: !req.operationName,
    load
  });

  return {
    loading,
    data: data?.data,
    error: error || (data?.errors?.length ? data as GqlErrorResponse : undefined),

    update: useCallback((arg: D | Updator<D>) => {
      update((old) => old && ({ data: normalizeUpdator(arg)(old.data) }));
    }, [update]),
    reload,
  };
}