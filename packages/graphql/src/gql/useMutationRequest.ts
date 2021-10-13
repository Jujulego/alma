import { ApiParams, ApiPostRequestConfig, ApiPromise, usePostRequest } from '@jujulego/alma-api';
import { useDeepMemo } from '@jujulego/alma-utils';
import axios from 'axios';
import { useCallback, useDebugValue } from 'react';

import { GqlErrorResponse, GqlRequest, GqlResponse, GqlState, GqlVariables } from '../types';

// Types
export interface GqlMutationState<D, V extends GqlVariables> extends GqlState<D> {
  /**
   * Send a mutation request
   *
   * @param vars: variables to send with the document
   */
  send: (vars: V) => ApiPromise<D>;
}

// Hook
export function useMutationRequest<D, V extends GqlVariables = GqlVariables>(url: string, req: GqlRequest<D, V>, config: ApiPostRequestConfig = {}): GqlMutationState<D, V> {
  useDebugValue(req.operationName);

  // Stabilise objects
  const sconfig = useDeepMemo(config);

  // Request generator
  const generator = useCallback((vars: V, signal: AbortSignal) => axios.post<GqlResponse<D>>(
    url,
    { ...req, variables: vars },
    { ...sconfig, signal }
  ), [url, req, sconfig]);

  // Api call
  const { send, loading, data, error } = usePostRequest<V, GqlResponse<D>, ApiParams, GqlErrorResponse>(generator);

  return {
    loading,
    data: data?.data,
    error: error || (data?.errors?.length ? data as GqlErrorResponse : undefined),

    send: useCallback((vars: V) => {
      return send(vars)
        .then((data) => data.data);
    }, [send])
  };
}