import { ApiGetRequestConfig } from '@jujulego/alma-api';
import { useEffect, useMemo } from 'react';

import { GqlDocument, GqlQueryReturn, GqlVariables } from '../types';
import { useQueryRequest } from './useQueryRequest';
import { buildRequest } from '../utils';

/**
 * Send a graphql query, then return status and result of the request.
 *
 * @param url: URL of the graphql endpoint
 * @param doc: graphql query
 * @param vars: query variables
 * @param config: axios configuration
 */
export function useGqlQuery<R, V extends GqlVariables = GqlVariables, E = unknown>(url: string, doc: GqlDocument, vars: V, config?: ApiGetRequestConfig): GqlQueryReturn<R, E> {
  // Build request
  const req = useMemo(() => buildRequest(doc), [doc]);

  // Effects
  useEffect(() => {
    if (!req.operationName) console.warn('No operation name found in document, result won\'t be cached');
  }, [req]);

  // Api call
  return useQueryRequest<R, V, E>(url, req, vars, config);
}