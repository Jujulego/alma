import { useDeepMemo } from '@jujulego/alma-utils';
import { useCallback, useContext } from 'react';

import { ApiConfigContext } from '../ApiConfigContext';
import { ApiResource } from '../ApiResource';
import { ApiUrl, normalizeUrl } from '../utils';
import { ApiHeaders, ApiMethod, ApiMethodBody, ApiResponseType, ApiRTConstraint } from '../types';

// Types
export interface UseApiRequestOptions {
  headers?: ApiHeaders;
}

export type UseApiRequestSend<M extends ApiMethod, D, B, A> = (opt: { arg: A } & ApiMethodBody<B>[M]) => ApiResource<D>;

export interface UseApiRequestProps<M extends ApiMethod, D, B, A> {
  send: UseApiRequestSend<M, D, B, A>;
}

// Hook
export function useApiRequest<M extends ApiMethod, RT extends ApiResponseType, D extends ApiRTConstraint[RT] = ApiRTConstraint[RT], B = unknown, A = void>(method: M, responseType: RT, url: ApiUrl<A>, options: UseApiRequestOptions = {}): UseApiRequestProps<M, D, B, A> {
  const { headers = {} } = options;

  // Stabilize objects
  const _headers = useDeepMemo(headers);

  // Contexts
  const { fetcher } = useContext(ApiConfigContext);

  // Callback
  const send = useCallback<UseApiRequestSend<M, D, B, A>>(({ arg, body }) => {
    // Compute request url & resource id
    const _url = normalizeUrl(url)(arg);

    // Create resource
    const abort = new AbortController();
    const prom = fetcher({
      method,
      url: _url,
      headers: _headers,
      body,
      responseType
    }, abort.signal);

    return new ApiResource(prom, abort) as ApiResource<D>;
  }, [fetcher, method, url, _headers, responseType]);

  return { send };
}
