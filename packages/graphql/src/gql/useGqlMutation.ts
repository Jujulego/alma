import { ApiPostRequestConfig } from '@jujulego/alma-api';
import { useDeepMemo } from '@jujulego/alma-utils';
import { useMemo } from 'react';

import { GqlDocument, GqlVariables } from '../types';
import { GqlMutationState, useMutationRequest } from './useMutationRequest';
import { buildRequest } from '../utils';

/**
 * Send a graphql mutation, then return status and result of the request.
 *
 * @param url: URL of the graphql endpoint
 * @param doc: graphql query
 * @param config: axios configuration
 */
export function useGqlMutation<D, V extends GqlVariables>(url: string, doc: GqlDocument, config?: ApiPostRequestConfig): GqlMutationState<D, V> {
  // Memos
  const req = useDeepMemo(useMemo(() => buildRequest(doc), [doc]));

  // Api call
  return useMutationRequest<D, V>(url, req, config);
}