import { useApi } from '@jujulego/alma-api';
import { useDeepMemo } from '@jujulego/alma-utils';
import { useCallback, useMemo } from 'react';

import { GqlRequest, GqlResource, GqlResponse, GqlVars } from '../types';
import { buildRequest, GqlDoc } from '../utils';

// Types
export type RequestSender<D, V extends GqlVars> = (vars: V) => GqlResource<D>;

// Hook
export function useGqlHttp<D, V extends GqlVars = GqlVars>(url: string, doc: GqlDoc<V>): RequestSender<D, V> {
  // Request
  const _doc = useDeepMemo(doc);
  const request = useMemo(() => buildRequest(_doc), [_doc]);

  // Api
  const send = useApi<GqlResponse<D>, GqlRequest<V>>('post', url);

  // Callbacks
  return useCallback(
    (vars: V) => send({ ...request, variables: vars })
      .then(({ data }) => data),
    [send, request]
  );
}
