import { useApi } from '@jujulego/alma-api';
import { useCallback } from 'react';

import { GqlRequest, GqlResource, GqlResponse, GqlVars } from '../types';

// Types
export type RequestSender<D, V extends GqlVars> = (vars: V) => GqlResource<D>;

// Hook
export function useGqlHttp<D, V extends GqlVars = GqlVars>(url: string, doc: string): RequestSender<D, V> {
  // Api
  const send = useApi<GqlResponse<D>, GqlRequest<V>>('post', url);

  // Callbacks
  return useCallback(
    (vars: V) => send({ query: doc, variables: vars }),
    [send, doc]
  );
}
