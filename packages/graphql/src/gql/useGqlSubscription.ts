import { useDeepMemo } from '@jujulego/alma-utils';
import { useMemo } from 'react';

import { GqlDocument, GqlVariables } from '../types';
import { GqlSubscriptionData, useSubscriptionRequest } from './useSubscriptionRequest';
import { buildRequest } from '../utils';

/**
 * Send a graphql subscription, then return each result of the request.
 *
 * @param url: URL of the graphql endpoint
 * @param doc: graphql query
 */
export function useGqlSubscription<D, V extends GqlVariables = GqlVariables>(url: string, doc: GqlDocument<D, V>): GqlSubscriptionData<D, V> {
  // Build request
  const req = useDeepMemo(useMemo(() => buildRequest(doc), [doc]));

  // Api call
  return useSubscriptionRequest<D, V>(req);
}