import { ApiGetRequestConfig } from '@jujulego/alma-api';
import { useDeepMemo } from '@jujulego/alma-utils';
import { useEffect, useMemo } from 'react';

import { GqlDocument, GqlVariables } from '../types';
import { GqlQueryState, useQueryRequest } from './useQueryRequest';
import { buildRequest } from '../utils';

/**
 * Send a graphql query, then return status and result of the request.
 *
 * @param url: URL of the graphql endpoint
 * @param doc: graphql query
 * @param vars: query variables
 * @param config: axios configuration
 */
export function useGqlQuery<R, V extends GqlVariables = GqlVariables>(url: string, doc: GqlDocument, vars: V, config?: ApiGetRequestConfig): GqlQueryState<R> {
  // Build request
  const req = useDeepMemo(useMemo(() => buildRequest(doc), [doc]));

  // Effects
  useEffect(() => {
    if (!req.operationName) console.warn('No operation name found in document, result will not be cached');
  }, [req]);

  // Api call
  return useQueryRequest<R, V>(url, req, vars, config);
}