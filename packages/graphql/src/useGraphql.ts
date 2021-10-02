import { ApiGetRequestConfig, useGetRequest, Updator } from '@jujulego/alma-api';
import { useDeepMemo } from '@jujulego/alma-utils';
import axios, { CancelTokenSource } from 'axios';
import { useCallback, useDebugValue, useEffect, useMemo } from 'react';

import { GqlDocument, GqlErrorResponse, GqlResponse, GqlReturn, GqlVariables } from './types';
import { buildRequest } from './utils';


export function useGraphql<R, V extends GqlVariables = GqlVariables, E = unknown>(url: string, doc: GqlDocument, vars: V, config: ApiGetRequestConfig = {}): GqlReturn<R, E> {
  useDebugValue(url);
  const { load, ...rconfig } = config;

  // Memos
  const req = useDeepMemo(useMemo(() => buildRequest(doc), [doc]));

  // Callbacks
  const generator = useCallback(
    (source: CancelTokenSource) => axios.post<GqlResponse<R>>(url, { ...req, variables: vars }, { ...rconfig, cancelToken: source.token }),
    [url, req, useDeepMemo(vars), useDeepMemo(rconfig)] // eslint-disable-line react-hooks/exhaustive-deps
  );

  // Effects
  useEffect(() => {
    if (!req.operationName) console.warn('No operation name found in document, result won\'t be cached');
  }, [req]);

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
    }, [update])
  };
}