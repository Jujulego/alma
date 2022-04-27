import { useDeepMemo } from '@jujulego/alma-utils';
import { useCallback, useContext } from 'react';

import { ApiResource } from '../ApiResource';
import { ApiConfigContext } from '../config';
import {
  ApiDataConstraint as ADC,
  ApiMethod, ApiQuery,
  ApiResponseTypeFor as ARTF,
  EnforceRequestType as ERT,
  RequestOptions
} from '../types';
import { ApiTypedMethod, ApiUrl } from '../utils';
import { useApiUrl } from './useApiUrl';

// Types
export type RequestSender<A, B, D> = A extends void
  ? (body?: B, query?: ApiQuery) => ApiResource<D>
  : (arg: A, body?: B, query?: ApiQuery) => ApiResource<D>;

// Hook
export function useApi<D, B = unknown, A = void>(method: ApiTypedMethod<D, B>, url: ApiUrl<A>, options: ERT<RequestOptions, 'arraybuffer'>): RequestSender<A, B, D & ADC<'arraybuffer'>>;
export function useApi<D, B = unknown, A = void>(method: ApiTypedMethod<D, B>, url: ApiUrl<A>, options: ERT<RequestOptions, 'blob'>): RequestSender<A, B, D & ADC<'blob'>>;
export function useApi<D, B = unknown, A = void>(method: ApiTypedMethod<D, B>, url: ApiUrl<A>, options: ERT<RequestOptions, 'text'>): RequestSender<A, B, D & ADC<'text'>>;
export function useApi<D, B = unknown, A = void>(method: ApiTypedMethod<D, B>, url: ApiUrl<A>, options?: RequestOptions<ARTF<D>>): RequestSender<A, B, D>;

export function useApi<D, B, A>(method: ApiMethod, url: ApiUrl<A>, options: RequestOptions<ARTF<D>> = {}): RequestSender<A, B, D> {
  const { query = {}, headers = {}, responseType = 'json' as ARTF<D>, config: optConfig = {} } = options;

  // Contexts
  const ctxConfig = useContext(ApiConfigContext);

  // Memos
  const _query = useDeepMemo(query);
  const _headers = useDeepMemo(headers);
  const _url = useApiUrl(url);

  // Callbacks
  const { fetcher = ctxConfig.fetcher } = optConfig;

  return useCallback((...args: unknown[]) => {
    // Parse arguments
    let arg: A | void;
    let body: B | undefined;
    let query: ApiQuery;

    if (_url.length === 0) {
      [body, query = {}] = args as [B | undefined, ApiQuery | undefined];
    } else {
      [arg, body, query = {}] = args as [A, B | undefined, ApiQuery | undefined];
    }

    // Send request
    const abort = new AbortController();
    const promise = fetcher<D>({
      method,
      url: arg === undefined ? (_url as () => string)() : _url(arg),
      query: { ..._query, ...query },
      headers: _headers,
      body,
      responseType,
    }, abort.signal);

    return new ApiResource<D>(promise, abort);
  }, [fetcher, method, _url, _query, _headers, responseType]) as RequestSender<A, B, D>;
}
