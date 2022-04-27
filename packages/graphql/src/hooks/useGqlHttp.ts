import { useApi } from '@jujulego/alma-api';
import { useCallback } from 'react';

import { GqlRequest, GqlResponse, GqlVars } from '../types';

// Hook
export function useGqlHttp<D, V extends GqlVars = GqlVars>(url: string, doc: string) {
  // Api
  const send = useApi<GqlResponse<D>, GqlRequest<V>>('post', url);

  // Callbacks
  return useCallback(
    (vars: V) => send({ query: doc, variables: vars })
      .then(({ data }) => data),
    [send, doc]
  );
}
