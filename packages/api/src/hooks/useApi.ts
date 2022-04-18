import { useDeepMemo } from '@jujulego/alma-utils';
import { useCallback, useMemo } from 'react';

import { ApiResource } from '../ApiResource';
import {
  ApiDataConstraint as ADC,
  ApiHeaders,
  ApiMethod,
  ApiResponseType,
  ApiResponseTypeFor as ARTF,
  RequestTypeOption
} from '../types';
import { useApiRequest } from './useApiRequest';
import { ApiUrl, normalizeUrl, URL_DEPS_SYMBOL } from '../utils';

// Types
export type RequestOptions<RT extends ApiResponseType> = RequestTypeOption<RT> & {
  headers?: ApiHeaders;
};

export type QuerySender<A, D> = A extends void ? () => ApiResource<D> : (arg: A) => ApiResource<D>;
export type MutationSender<A, B, D> = A extends void ? (body: B) => ApiResource<D> : (arg: A, body: B) => ApiResource<D>;
export type RequestSender<A, B, D> = A extends void ? (body?: B) => ApiResource<D> : (arg: A, body?: B) => ApiResource<D>;

// Hook
export function useApi<D extends ADC<'arraybuffer'> = ADC<'arraybuffer'>, A = void>(method: 'get' | 'head' | 'options' | 'delete', url: ApiUrl<A>, options: RequestOptions<'arraybuffer'>): QuerySender<A, D>;
export function useApi<D extends ADC<'blob'> = ADC<'blob'>, A = void>(method: 'get' | 'head' | 'options' | 'delete', url: ApiUrl<A>, options: RequestOptions<'blob'>): QuerySender<A, D>;
export function useApi<D extends ADC<'json'> = ADC<'json'>, A = void>(method: 'get' | 'head' | 'options' | 'delete', url: ApiUrl<A>, options?: RequestOptions<'json'>): QuerySender<A, D>;
export function useApi<D extends ADC<'text'> = ADC<'text'>, A = void>(method: 'get' | 'head' | 'options' | 'delete', url: ApiUrl<A>, options: RequestOptions<'text'>): QuerySender<A, D>;
export function useApi<D, A = void>(method: 'get' | 'head' | 'options' | 'delete', url: ApiUrl<A>, options?: RequestOptions<ARTF<D>>): QuerySender<A, D>;

export function useApi<B, D extends ADC<'arraybuffer'> = ADC<'arraybuffer'>, A = void>(method: 'post' | 'patch' | 'put', url: ApiUrl<A>, options: RequestOptions<'arraybuffer'>): MutationSender<A, B, D>;
export function useApi<B, D extends ADC<'blob'> = ADC<'blob'>, A = void>(method: 'post' | 'patch' | 'put', url: ApiUrl<A>, options: RequestOptions<'blob'>): MutationSender<A, B, D>;
export function useApi<B, D extends ADC<'json'> = ADC<'json'>, A = void>(method: 'post' | 'patch' | 'put', url: ApiUrl<A>, options?: RequestOptions<'json'>): MutationSender<A, B, D>;
export function useApi<B, D extends ADC<'text'> = ADC<'text'>, A = void>(method: 'post' | 'patch' | 'put', url: ApiUrl<A>, options: RequestOptions<'text'>): MutationSender<A, B, D>;
export function useApi<B, D, A = void>(method: 'post' | 'patch' | 'put', url: ApiUrl<A>, options?: RequestOptions<ARTF<D>>): MutationSender<A, B, D>;

export function useApi<B, D, A = void>(method: ApiMethod, url: ApiUrl<A>, options?: RequestOptions<ARTF<D>>): RequestSender<A, B, D> {
  const { headers = {}, responseType = 'json' } = options ?? {};

  const _headers = useDeepMemo(headers);
  const _url = useMemo(() => normalizeUrl(url), useDeepMemo((url as any)[URL_DEPS_SYMBOL]));

  // Contexts
  const { request } = useApiRequest();

  // Callbacks
  return useCallback((...args: unknown[]) => {
    let arg: A | void;
    let body: B | undefined = undefined;

    if (args.length >= 2) {
      [arg, body] = args as [A, B];
    } else if (_url.length === 0) {
      [body] = args as [B];
    } else {
      [arg] = args as [A];
    }

    return request<ApiMethod, D>({
      method,
      url: arg === undefined ? (_url as () => string)() : _url(arg),
      headers: _headers,
      body,
      responseType: responseType as ARTF<D>,
    });
  }, [request, method, _url, _headers, responseType]) as RequestSender<A, B, D>;
}
