import { ApiGetRequestConfig, ApiGetReturn, useGetRequest } from '@jujulego/alma-api';
import { useDeepMemo } from '@jujulego/alma-utils';
import axios, { CancelTokenSource } from 'axios';
import { useCallback, useDebugValue, useEffect, useMemo } from 'react';

import { buildRequest, GqlDocument, GqlVariables } from './utils';

// Types
export function useGraphql<R, V extends GqlVariables = GqlVariables, E = unknown>(url: string, doc: GqlDocument, vars: V, config: ApiGetRequestConfig = {}): ApiGetReturn<R, E> {
  useDebugValue(url);
  const { load, ...rconfig } = config;

  // Memos
  const req = useDeepMemo(useMemo(() => buildRequest(doc), [doc]));

  // Callbacks
  const generator = useCallback(
    (source: CancelTokenSource) => axios.post<R>(url, { ...req, variables: vars }, { ...rconfig, cancelToken: source.token }),
    [url, req, useDeepMemo(vars), useDeepMemo(rconfig)] // eslint-disable-line react-hooks/exhaustive-deps
  );

  // Effects
  useEffect(() => {
    if (!req.operationName) console.warn('No operation name found in document, result won\'t be cached');
  }, [req]);

  return useGetRequest<R, E>(generator, `graphql:${url}:${req.operationName}`, { noCache: !req.operationName, load });
}