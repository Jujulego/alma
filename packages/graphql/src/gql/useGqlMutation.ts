import { ApiPostRequestConfig } from '@jujulego/alma-api';
import { useDeepMemo } from '@jujulego/alma-utils';
import { useEffect, useMemo } from 'react';

import { GqlDocument, GqlVariables, GqlMutationReturn } from '../types';
import { buildRequest } from '../utils';
import { useMutationRequest } from './useMutationRequest';

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

  // Effects
  useEffect(() => {
    if (!req.operationName) console.warn('No operation name found in document, result won\'t be cached');
  }, [req]);

  // Api call
  return useMutationRequest<R, V, E>(url, req, config);
}