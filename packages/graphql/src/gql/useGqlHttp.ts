import { ApiPromise, useApiRequest } from '@jujulego/alma-api';
import { useDeepMemo } from '@jujulego/alma-utils';
import { useCallback, useMemo } from 'react';

import { GqlDocument, GqlRequest, GqlResponse, GqlVariables } from '../types';
import { buildRequest } from '../utils';

// Types
export interface GqlHttpState<D, V extends GqlVariables> {
  /**
   * Indicates if the request is running.
   */
  loading: boolean;

  /**
   * Send the given graphql request
   *
   * @param vars to send with the document
   */
  send: (vars: V) => ApiPromise<GqlResponse<D>>;
}

// Hook
export function useGqlHttp<D, V extends GqlVariables = GqlVariables>(url: string, doc: GqlDocument<D, V> | GqlRequest<D, V>): GqlHttpState<D, V> {
  // Build request
  const sdoc = useDeepMemo(doc);
  const req = useMemo(() => buildRequest(sdoc), [sdoc]);

  // Request
  const { loading, send } = useApiRequest<'post', GqlRequest<D, V>, GqlResponse<D>>();

  return {
    loading,
    send: useCallback((vars: V) => {
      return send({ method: 'post', url, headers: {}, body: { ...req, variables: vars }})
        .then((res) => res.data);
    }, [send, url, req]),
  };
}