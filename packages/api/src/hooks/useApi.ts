import { useDeepMemo } from '@jujulego/alma-utils';
import { useCallback } from 'react';

import { ApiResource } from '../ApiResource';
import {
  ApiDataConstraint as ADC,
  ApiMethod, ApiMutationMethod, ApiQueryMethod,
  ApiResponseTypeFor as ARTF,
  EnforceRequestType as ERT,
  RequestOptions
} from '../types';
import { ApiUrl } from '../utils';
import { useApiRequest } from './useApiRequest';
import { useApiUrl } from './useApiUrl';

// Types
export type QuerySender<A, D> = A extends void ? () => ApiResource<D> : (arg: A) => ApiResource<D>;
export type MutationSender<A, B, D> = A extends void ? (body: B) => ApiResource<D> : (arg: A, body: B) => ApiResource<D>;
export type RequestSender<A, B, D> = A extends void ? (body?: B) => ApiResource<D> : (arg: A, body?: B) => ApiResource<D>;

// Hook
export function useApi<D = ADC<'arraybuffer'>, A = void>(method: ApiQueryMethod, url: ApiUrl<A>, options: ERT<RequestOptions, 'arraybuffer'>): QuerySender<A, D>;
export function useApi<D = ADC<'blob'>, A = void>(method: ApiQueryMethod, url: ApiUrl<A>, options: ERT<RequestOptions, 'blob'>): QuerySender<A, D>;
export function useApi<D = ADC<'text'>, A = void>(method: ApiQueryMethod, url: ApiUrl<A>, options: ERT<RequestOptions, 'text'>): QuerySender<A, D>;
export function useApi<D, A = void>(method: ApiQueryMethod, url: ApiUrl<A>, options?: RequestOptions<ARTF<D>>): QuerySender<A, D>;

export function useApi<B, D = ADC<'arraybuffer'>, A = void>(method: ApiMutationMethod, url: ApiUrl<A>, options: ERT<RequestOptions, 'arraybuffer'>): MutationSender<A, B, D>;
export function useApi<B, D = ADC<'blob'>, A = void>(method: ApiMutationMethod, url: ApiUrl<A>, options: ERT<RequestOptions, 'blob'>): MutationSender<A, B, D>;
export function useApi<B, D = ADC<'text'>, A = void>(method: ApiMutationMethod, url: ApiUrl<A>, options: ERT<RequestOptions, 'text'>): MutationSender<A, B, D>;
export function useApi<B, D, A = void>(method: ApiMutationMethod, url: ApiUrl<A>, options?: RequestOptions<ARTF<D>>): MutationSender<A, B, D>;

export function useApi<B, D, A>(method: ApiMethod, url: ApiUrl<A>, options: RequestOptions<ARTF<D>> = {}): RequestSender<A, B, D> {
  const { headers = {}, responseType = 'json' as ARTF<D> } = options;

  const _headers = useDeepMemo(headers);
  const _url = useApiUrl(url);

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
      responseType,
    });
  }, [request, method, _url, _headers, responseType]) as RequestSender<A, B, D>;
}
