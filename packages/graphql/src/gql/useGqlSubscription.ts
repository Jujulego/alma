import { useDeepMemo } from '@jujulego/alma-utils';
import { useDebugValue, useMemo } from 'react';
import { v4 as uuid } from 'uuid';

import { GqlDocument, GqlVariables } from '../types';
import { GqlSubscriptionData, useSubscriptionRequest } from './useSubscriptionRequest';
import { buildRequest } from '../utils';

/**
 * Send a graphql subscription, then return each result of the request.
 *
 * @param url: URL of the graphql endpoint
 * @param doc: graphql query
 * @param vars: query variables
 */
export function useGqlSubscription<D, V extends GqlVariables = GqlVariables>(url: string, doc: GqlDocument<D, V>, vars: V): GqlSubscriptionData<D> {
  // Build request
  const req = useDeepMemo(useMemo(() => buildRequest(doc), [doc]));
  const id = useMemo(() => uuid(), [url, req]); // eslint-disable-line react-hooks/exhaustive-deps

  useDebugValue(id);

  // Api call
  return useSubscriptionRequest<D, V>(id, req, vars);
}