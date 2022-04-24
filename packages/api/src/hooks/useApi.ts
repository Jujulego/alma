import { useDeepMemo } from '@jujulego/alma-utils';
import { useCallback, useContext } from 'react';

import { ApiResource } from '../ApiResource';
import { ApiConfigContext } from '../config';
import {
  ApiDataConstraint as ADC,
  ApiMethod,
  ApiResponseTypeFor as ARTF,
  EnforceRequestType as ERT,
  RequestOptions
} from '../types';
import { ApiTypedMethod, ApiUrl } from '../utils';
import { useApiUrl } from './useApiUrl';

// Types
export type RequestSender<A, B, D> = A extends void ? (body?: B) => ApiResource<D> : (arg: A, body?: B) => ApiResource<D>;

// Hook
export function useApi<D, B = unknown, A = void>(method: ApiTypedMethod<D | ADC<'arraybuffer'>, B>, url: ApiUrl<A>, options: ERT<RequestOptions, 'arraybuffer'>): RequestSender<A, B, D>;
export function useApi<D, B = unknown, A = void>(method: ApiTypedMethod<D | ADC<'blob'>, B>, url: ApiUrl<A>, options: ERT<RequestOptions, 'blob'>): RequestSender<A, B, D>;
export function useApi<D, B = unknown, A = void>(method: ApiTypedMethod<D | ADC<'text'>, B>, url: ApiUrl<A>, options: ERT<RequestOptions, 'text'>): RequestSender<A, B, D>;
export function useApi<D, B = unknown, A = void>(method: ApiTypedMethod<D, B>, url: ApiUrl<A>, options?: RequestOptions<ARTF<D>>): RequestSender<A, B, D>;

export function useApi<D, B, A>(method: ApiMethod, url: ApiUrl<A>, options: RequestOptions<ARTF<D>> = {}): RequestSender<A, B, D> {
  const { headers = {}, responseType = 'json' as ARTF<D>, config: optConfig = {} } = options;

  // Contexts
  const ctxConfig = useContext(ApiConfigContext);

  // Memos
  const _headers = useDeepMemo(headers);
  const _url = useApiUrl(url);

  // Callbacks
  const { fetcher = ctxConfig.fetcher } = optConfig;

  return useCallback((...args: unknown[]) => {
    // Parse arguments
    let arg: A | void;
    let body: B | undefined = undefined;

    if (args.length >= 2) {
      [arg, body] = args as [A, B];
    } else if (_url.length === 0) {
      [body] = args as [B];
    } else {
      [arg] = args as [A];
    }

    // Send request
    const abort = new AbortController();
    const promise = fetcher<D>({
      method,
      url: arg === undefined ? (_url as () => string)() : _url(arg),
      headers: _headers,
      body,
      responseType,
    }, abort.signal);

    return new ApiResource<D>(promise, abort);
  }, [fetcher, method, _url, _headers, responseType]) as RequestSender<A, B, D>;
}
