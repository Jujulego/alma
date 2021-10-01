import { ApiGetRequestConfig, ApiGetReturn, useGetRequest } from '@jujulego/alma-api';
import { useDeepMemo } from '@jujulego/alma-utils';
import axios, { CancelTokenSource } from 'axios';
import { useCallback, useDebugValue, useMemo } from 'react';

import { buildRequest, GraphqlDocument } from './utils';

export function useGraphql<R, E = unknown>(url: string, doc: GraphqlDocument, config: ApiGetRequestConfig = {}): ApiGetReturn<R, E> {
  useDebugValue(url);
  const { load, ...rconfig } = config;

  // Memos
  const req = useMemo(() => buildRequest(doc), [doc]);

  // Callbacks
  const generator = useCallback(
    (source: CancelTokenSource) => axios.post<R>(url, req, { ...rconfig, cancelToken: source.token }),
    [url, useDeepMemo(req), useDeepMemo(rconfig)] // eslint-disable-line react-hooks/exhaustive-deps
  );

  return useGetRequest<R, E>(generator, `graphql:${url}:${req.operationName}`, { noCache: !req.operationName, load });
}