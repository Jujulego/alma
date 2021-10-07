import { ApiParams, ApiPostRequestConfig, usePostRequest } from '@jujulego/alma-api';
import { useDeepMemo } from '@jujulego/alma-utils';
import axios, { CancelTokenSource } from 'axios';
import { useCallback, useDebugValue } from 'react';

import { GqlErrorResponse, GqlMutationReturn, GqlRequest, GqlResponse, GqlVariables } from '../types';

export function useMutationRequest<R, V extends GqlVariables = GqlVariables>(url: string, req: GqlRequest, config: ApiPostRequestConfig = {}): GqlMutationReturn<V, R> {
  useDebugValue(req.operationName);

  // Stabilise objects
  const sconfig = useDeepMemo(config);

  // Request generator
  const generator = useCallback((vars: V, source: CancelTokenSource) => axios.post<GqlResponse<R>>(
    url,
    { ...req, variables: vars },
    { ...sconfig, cancelToken: source.token }
  ), [url, req, sconfig]);

  // Api call
  const { send, loading, data, error } = usePostRequest<V, GqlResponse<R>, ApiParams, GqlErrorResponse>(generator);

  return {
    loading: loading,
    data: data?.data,
    error: error || (data?.errors?.length ? data as GqlErrorResponse : undefined),

    send: useCallback((vars: V) => {
      return send(vars)
        .then((data) => data.data);
    }, [send])
  };
}