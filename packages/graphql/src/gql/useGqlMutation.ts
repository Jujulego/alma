import { ApiPostRequestConfig, usePostRequest, ApiParams } from '@jujulego/alma-api';
import { useDeepMemo } from '@jujulego/alma-utils';
import axios, { CancelTokenSource } from 'axios';
import { useCallback, useDebugValue, useEffect, useMemo } from 'react';

import { GqlDocument, GqlErrorResponse, GqlResponse, GqlVariables, GqlMutationReturn } from '../types';
import { buildRequest } from '../utils';

/**
 * Send a graphql mutation, then return status and result of the request.
 *
 * @param url: URL of the graphql endpoint
 * @param doc: graphql query
 * @param config: axios configuration
 */
export function useGqlMutation<R, V extends GqlVariables, E = unknown>(url: string, doc: GqlDocument, config: ApiPostRequestConfig = {}): GqlMutationReturn<V, R, E> {
  // Memos
  const req = useDeepMemo(useMemo(() => buildRequest(doc), [doc]));
  useDebugValue(req.operationName);

  // Callbacks
  const generator = useCallback(
    (vars: V, source: CancelTokenSource) => axios.post<GqlResponse<R>>(url, { ...req, variables: vars }, { ...config, cancelToken: source.token }),
    [url, req, useDeepMemo(config)] // eslint-disable-line react-hooks/exhaustive-deps
  );

  // Effects
  useEffect(() => {
    if (!req.operationName) console.warn('No operation name found in document, result won\'t be cached');
  }, [req]);

  // Api call
  const { send, data, error, ...state } = usePostRequest<V, GqlResponse<R>, ApiParams, E | GqlErrorResponse>(generator);

  return {
    ...state,
    data: data?.data,
    error: error || (data?.errors?.length ? data as GqlErrorResponse : undefined),
    send: useCallback((vars: V) => {
      return send(vars)
        .then((data) => data?.data);
    }, [send])
  };
}